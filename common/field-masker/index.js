/**
 * Field Masker Filter (post-response)
 *
 * Masks specified fields in any JSON document the upstream MCP server
 * returns. The filter is shape-agnostic: it walks the response tree
 * and rewrites every value whose key is in `masked_fields`.
 *
 * Supports two response shapes:
 *
 *   1. arguments.response_rows — an array of strings, each a JSON-
 *      encoded row (mcp-toolbox / DB MCP convention). Each frame is
 *      parsed, masked, and re-serialised.
 *
 *   2. arguments.response_data — a string or object payload. We try
 *      JSON.parse first; if it parses, we deep-mask the resulting tree.
 *      If it's plain text we pass it through untouched (no fields to
 *      mask in raw text).
 *
 * Configuration:
 *   {
 *     "masked_fields": ["salary", "ssn", "password", "secret", "token"],
 *     "mask_value":    "***REDACTED***",   // string that replaces matched values
 *     "case_sensitive": false              // default false
 *   }
 *
 * Returns {action: 'modify', modified_response, masked_count} if
 * anything was rewritten, otherwise {action: 'allow'}.
 *
 * Contract: POST /filter { config, arguments, metadata }
 */
const http = require('http');

const PORT = process.env.PORT || 6008;
const DEFAULT_FIELDS = ['salary', 'ssn', 'password', 'secret', 'token'];

function buildLookup(fields, caseSensitive) {
  const set = new Set();
  for (const f of fields) {
    set.add(caseSensitive ? f : f.toLowerCase());
  }
  return set;
}

function shouldMask(key, lookup, caseSensitive) {
  if (!key) return false;
  return lookup.has(caseSensitive ? key : key.toLowerCase());
}

/**
 * Walk a value, masking any field whose key matches. Returns
 * { masked, count } where masked is the rewritten value.
 */
function deepMask(value, lookup, caseSensitive, maskValue, counter) {
  if (Array.isArray(value)) {
    return value.map((v) => deepMask(v, lookup, caseSensitive, maskValue, counter));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (shouldMask(k, lookup, caseSensitive)) {
        out[k] = maskValue;
        counter.n += 1;
      } else {
        out[k] = deepMask(v, lookup, caseSensitive, maskValue, counter);
      }
    }
    return out;
  }
  return value;
}

function tryParseJSON(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return value;
  try { return JSON.parse(trimmed); } catch { return value; }
}

function maskRows(rows, lookup, caseSensitive, maskValue, counter) {
  return rows.map((frame) => {
    const parsed = tryParseJSON(frame);
    if (parsed === frame) return frame;             // not JSON, leave alone
    const masked = deepMask(parsed, lookup, caseSensitive, maskValue, counter);
    return JSON.stringify(masked);
  });
}

function evaluate(args, config) {
  const fields = config.masked_fields && config.masked_fields.length
    ? config.masked_fields
    : DEFAULT_FIELDS;
  const maskValue = typeof config.mask_value === 'string' ? config.mask_value : '***REDACTED***';
  const caseSensitive = config.case_sensitive === true;
  const lookup = buildLookup(fields, caseSensitive);
  const counter = { n: 0 };

  // Preferred: per-row frames.
  if (Array.isArray(args.response_rows)) {
    const maskedRows = maskRows(args.response_rows, lookup, caseSensitive, maskValue, counter);
    if (counter.n === 0) return { action: 'allow', reason: 'No fields matched' };
    return {
      action: 'modify',
      reason: `Masked ${counter.n} field${counter.n === 1 ? '' : 's'}`,
      modified_response: {
        // Preserve the per-row shape so chained filters (e.g. Row
        // Limiter) keep operating on individual frames instead of one
        // joined blob.
        rows: maskedRows,
        original_count: maskedRows.length,
        masked_count: counter.n,
        masked_fields: fields,
        // Also include `content` for callers that don't yet handle
        // structured rows (the gateway falls back to this).
        content: maskedRows.join('\n'),
      },
    };
  }

  // Fallback: a single response_data payload.
  const data = args.response_data ?? args.result;
  if (data === undefined || data === null) {
    return { action: 'allow', reason: 'No response payload to mask' };
  }
  const parsed = tryParseJSON(data);
  if (parsed === data && typeof data !== 'object') {
    return { action: 'allow', reason: 'Response is not structured (no fields to mask)' };
  }
  const masked = deepMask(parsed, lookup, caseSensitive, maskValue, counter);
  if (counter.n === 0) return { action: 'allow', reason: 'No fields matched' };
  return {
    action: 'modify',
    reason: `Masked ${counter.n} field${counter.n === 1 ? '' : 's'}`,
    modified_response: {
      content: typeof data === 'string' ? JSON.stringify(masked) : masked,
      masked_count: counter.n,
      masked_fields: fields,
    },
  };
}

function handleFilter(req, res) {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      respond(res, evaluate(payload.arguments || {}, payload.config || {}));
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
    respond(res, { status: 'healthy', filter: 'field-masker', version: '1.0.0' });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Field Masker filter running on port ${PORT}`);
});
