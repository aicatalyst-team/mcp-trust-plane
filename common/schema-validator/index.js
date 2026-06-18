/**
 * Schema Validator Filter (pre-request)
 *
 * Validates MCP tool-call arguments against the tool's `inputSchema`.
 *
 * Schemas come from one of two places, in this order:
 *
 *   1. config.schemas[<tool_name>]   -- explicit override the operator
 *      configured in the policy. Useful when the upstream MCP server
 *      reports a schema you want to tighten.
 *
 *   2. live discovery from the upstream MCP catalog -- the gateway
 *      passes metadata.target_id (the deployment id of the MCP server
 *      being called). The filter calls
 *      ${TOOL_DISCOVERY_BASE}/api/v1/hub/mcp/<target_id>/tools and
 *      caches the response per target_id for 5 minutes. The tool's
 *      `inputSchema` (or `parameters`) becomes the validation schema.
 *
 * If neither source produces a schema, behaviour falls back to:
 *
 *   - strict=true   -> block (refuse to call an unknown tool)
 *   - strict=false  -> allow (default; non-disruptive)
 *
 * Configuration:
 *   {
 *     "strict": false,            // optional, default false
 *     "schemas": {                // optional per-tool overrides
 *       "run_sql": { ... }
 *     }
 *   }
 *
 * Environment:
 *   PORT                  default 6005
 *   TOOL_DISCOVERY_BASE   default http://172.16.1.86:5004
 *   TOOL_CACHE_TTL_MS     default 300000 (5 minutes)
 *
 * Contract: POST /filter { config, arguments, metadata } where
 *   metadata.tool_name and metadata.target_id are both populated by
 *   the engine.
 */
const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 6005;
const DISCOVERY_BASE = (process.env.TOOL_DISCOVERY_BASE || 'http://172.16.1.86:5004').replace(/\/$/, '');
const CACHE_TTL_MS = Number(process.env.TOOL_CACHE_TTL_MS || 300000);

const schemaCache = new Map(); // target_id -> { fetchedAt, schemasByTool }

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function validate(value, schema, path) {
  if (!schema || typeof schema !== 'object') return null;

  if (schema.type) {
    // JSON Schema lets `type` be either a string or an array of strings.
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = typeOf(value);
    const match = allowed.some((t) => {
      if (t === 'integer') return actual === 'number' && Number.isInteger(value);
      return actual === t;
    });
    if (!match) {
      return `${path || 'arguments'}: expected ${allowed.join('|')}, got ${actual}`;
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    return `${path}: value '${String(value)}' not in enum [${schema.enum.join(', ')}]`;
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      return `${path}: length ${value.length} < minLength ${schema.minLength}`;
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      return `${path}: length ${value.length} > maxLength ${schema.maxLength}`;
    }
    if (schema.pattern) {
      let re;
      try { re = new RegExp(schema.pattern); } catch { /* bad pattern */ }
      if (re && !re.test(value)) {
        return `${path}: does not match pattern ${schema.pattern}`;
      }
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      return `${path}: ${value} < minimum ${schema.minimum}`;
    }
    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      return `${path}: ${value} > maximum ${schema.maximum}`;
    }
  }

  if (Array.isArray(schema.required) && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const k of schema.required) {
      if (!(k in value) || value[k] === undefined || value[k] === null) {
        return `${path || 'arguments'}: missing required field '${k}'`;
      }
    }
  }

  if (schema.properties && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [k, sub] of Object.entries(schema.properties)) {
      if (k in value) {
        const childPath = path ? `${path}.${k}` : k;
        const err = validate(value[k], sub, childPath);
        if (err) return err;
      }
    }
  }

  if (schema.items && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const err = validate(value[i], schema.items, `${path}[${i}]`);
      if (err) return err;
    }
  }

  return null;
}

function getJSON(url) {
  return new Promise((resolve, reject) => {
    let parsed;
    try { parsed = new URL(url); } catch (e) { return reject(e); }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout: 8000,
      rejectUnauthorized: false,
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(chunks)); } catch (e) { reject(e); }
        } else {
          reject(new Error(`status ${res.statusCode}: ${chunks.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

/**
 * Returns a map keyed by tool name -> inputSchema, for the given MCP
 * deployment. Uses an in-process cache; misses fetch from
 * ${DISCOVERY_BASE}/api/v1/hub/mcp/<target_id>/tools.
 *
 * Obot returns the tools array in any of these wrappers depending on
 * the version: a bare array, { tools: [...] }, or the MCP /listTools
 * response { result: { tools: [...] } }. We accept all three.
 */
async function fetchSchemasForTarget(targetId) {
  if (!targetId) return null;
  const cached = schemaCache.get(targetId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.schemasByTool;
  }
  try {
    const url = `${DISCOVERY_BASE}/api/v1/hub/mcp/${encodeURIComponent(targetId)}/tools`;
    const data = await getJSON(url);
    const tools = Array.isArray(data) ? data
      : Array.isArray(data?.tools) ? data.tools
      : Array.isArray(data?.result?.tools) ? data.result.tools
      : [];
    const schemasByTool = {};
    for (const t of tools) {
      const name = t.name || t.tool_name;
      const schema = t.inputSchema || t.parameters || t.schema;
      if (name && schema) schemasByTool[name] = schema;
    }
    schemaCache.set(targetId, { fetchedAt: Date.now(), schemasByTool });
    return schemasByTool;
  } catch (err) {
    console.warn(`schema-validator: tool discovery failed for ${targetId}: ${err.message}`);
    schemaCache.set(targetId, { fetchedAt: Date.now(), schemasByTool: {} });
    return {};
  }
}

async function evaluate(args, metadata, config) {
  const toolName = (metadata && metadata.tool_name) || '';
  const targetId = (metadata && metadata.target_id) || '';
  const strict = config.strict === true;

  // Operator overrides win.
  let schema = (config.schemas || {})[toolName];

  // Live discovery fallback.
  if (!schema && targetId) {
    const schemasByTool = await fetchSchemasForTarget(targetId);
    if (schemasByTool && schemasByTool[toolName]) {
      schema = schemasByTool[toolName];
    }
  }

  if (!schema) {
    if (strict) {
      return { action: 'block', reason: `No schema for tool '${toolName || '(unknown)'}'` };
    }
    return { action: 'allow', reason: `No schema for '${toolName || '(unknown)'}' (strict=false)` };
  }

  const err = validate(args, schema, '');
  if (err) {
    return { action: 'block', reason: `Schema validation failed: ${err}` };
  }
  return { action: 'allow', reason: `Arguments match schema for '${toolName}'` };
}

function handleFilter(req, res) {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const result = await evaluate(payload.arguments || {}, payload.metadata || {}, payload.config || {});
      respond(res, result);
    } catch (err) {
      respond(res, { action: 'allow', reason: `Filter error: ${err.message}` });
    }
  });
}

function respond(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/filter') {
    handleFilter(req, res);
  } else if (req.url === '/health') {
    respond(res, { status: 'healthy', filter: 'schema-validator', version: '1.1.0' });
  } else if (req.url === '/cache/clear' && req.method === 'POST') {
    schemaCache.clear();
    respond(res, { cleared: true });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Schema Validator filter running on port ${PORT}, discovery=${DISCOVERY_BASE}`);
});
