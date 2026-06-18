// Behaviour tests — boots each filter and exercises the actual decision
// logic with realistic inputs. Meant to catch regressions in the filter
// bodies themselves, not just the wire contract.
//
// Run: node tests/behaviour.js

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

let failures = 0;
function check(name, ok, detail) {
  if (ok) { console.log('  PASS ' + name); }
  else { failures++; console.log('  FAIL ' + name + (detail ? ' -- ' + detail : '')); }
}

function post(port, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port, path: '/filter', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 3000,
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => { try { resolve(JSON.parse(chunks)); } catch (e) { resolve({}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function waitFor(port) {
  return new Promise((resolve, reject) => {
    let n = 0;
    const tick = () => {
      const r = http.get({ hostname: '127.0.0.1', port, path: '/health', timeout: 500 }, (res) => {
        if (res.statusCode === 200) resolve(); else retry();
      });
      r.on('error', retry);
      r.on('timeout', () => { r.destroy(); retry(); });
    };
    const retry = () => { n++; if (n >= 50) reject(new Error('health never passed')); else setTimeout(tick, 100); };
    tick();
  });
}

async function withFilter(slug, port, fn) {
  const proc = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname, '..', 'common', slug),
    env: Object.assign({}, process.env, { PORT: String(port) }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});
  try {
    await waitFor(port);
    console.log('\n' + slug);
    await fn();
  } finally {
    proc.kill('SIGTERM');
    await new Promise((r) => proc.on('exit', r));
  }
}

(async function main() {
  // SQL Guard
  await withFilter('sql-guard', 6201, async () => {
    let r = await post(6201, { config: {}, arguments: { sql: 'SELECT * FROM employees' }, metadata: {} });
    check('SELECT allowed by default', r.action === 'allow');

    r = await post(6201, { config: {}, arguments: { sql: 'DROP TABLE users' }, metadata: {} });
    check('DROP blocked by default', r.action === 'block');

    r = await post(6201, { config: { allow_only: ['SELECT'] }, arguments: { sql: 'INSERT INTO x VALUES (1)' }, metadata: {} });
    check('INSERT blocked when allow_only=SELECT', r.action === 'block');

    r = await post(6201, {
      config: { allow_only: ['SELECT'] },
      arguments: { sql: "SELECT * FROM orders WHERE delete_at IS NULL" },
      metadata: {},
    });
    check('SELECT with delete_at column not blocked (word-boundary)', r.action === 'allow');

    r = await post(6201, { config: {}, arguments: { sql: 'SELECT 1; -- comment' }, metadata: {} });
    check('SQL comments blocked', r.action === 'block');

    r = await post(6201, {
      config: { block_comments: false },
      arguments: { sql: 'SELECT 1 -- ok' },
      metadata: {},
    });
    check('SQL comments allowed when block_comments=false', r.action === 'allow');
  });

  // Rate Limiter
  await withFilter('rate-limiter', 6207, async () => {
    const cfg = { max_per_minute: 3, max_per_hour: 100, scope: 'per_agent' };
    const meta = { agent_id: 'agent-rate-test' };
    let allow = 0, block = 0;
    for (let i = 0; i < 5; i++) {
      const r = await post(6207, { config: cfg, arguments: {}, metadata: meta });
      if (r.action === 'allow') allow++;
      if (r.action === 'block') block++;
    }
    check('Exactly 3 allowed at max_per_minute=3', allow === 3, `allow=${allow} block=${block}`);
    check('Excess calls blocked', block === 2, `allow=${allow} block=${block}`);
  });

  // Row Limiter
  await withFilter('row-limiter', 6203, async () => {
    let r = await post(6203, {
      config: { max_rows: 3 },
      arguments: { response_count: 5, response_rows: ['r1','r2','r3','r4','r5'] },
      metadata: {},
    });
    check('Truncates to max_rows=3', r.action === 'truncate' && r.modified_response?.truncated_to === 3);
    check('Reports original count', r.original_count === 5);
    check('Returns kept rows array', Array.isArray(r.modified_response?.rows) && r.modified_response.rows.length === 3);

    r = await post(6203, {
      config: { max_rows: 100 },
      arguments: { response_count: 2, response_rows: ['a','b'] },
      metadata: {},
    });
    check('Allows when under limit', r.action === 'allow');
  });

  // Field Masker
  await withFilter('field-masker', 6208, async () => {
    let r = await post(6208, {
      config: { masked_fields: ['salary', 'ssn'], mask_value: '***' },
      arguments: {
        response_rows: [
          JSON.stringify({ id: 1, name: 'Alice', salary: 100000, ssn: '111-22-3333' }),
          JSON.stringify({ id: 2, name: 'Bob',   salary: 90000,  ssn: '222-33-4444' }),
        ],
      },
      metadata: {},
    });
    check('Masks salary + ssn fields', r.action === 'modify' && r.modified_response?.masked_count === 4);
    check('Returns rows array (not joined string)', Array.isArray(r.modified_response?.rows) && r.modified_response.rows.length === 2);
    const joined = (r.modified_response?.rows || []).join('\n');
    check('Original PII not present in any row', !/111-22-3333/.test(joined) && !/100000/.test(joined));
    check('Mask string present in rows', /\*\*\*/.test(joined));

    r = await post(6208, {
      config: { masked_fields: ['SECRET'], case_sensitive: true },
      arguments: { response_rows: [JSON.stringify({ secret: 'lower', SECRET: 'upper' })] },
      metadata: {},
    });
    check('Case-sensitive matches only exact key', r.action === 'modify' && r.modified_response?.masked_count === 1);

    r = await post(6208, {
      config: { masked_fields: ['nonexistent'] },
      arguments: { response_rows: [JSON.stringify({ a: 1 })] },
      metadata: {},
    });
    check('Allows when no fields match', r.action === 'allow');
  });

  // Schema Validator
  await withFilter('schema-validator', 6205, async () => {
    const schemas = {
      run_sql: {
        required: ['sql'],
        properties: {
          sql: { type: 'string', maxLength: 100 },
          limit: { type: 'integer', minimum: 1, maximum: 1000 },
        },
      },
    };

    let r = await post(6205, {
      config: { strict: true, schemas },
      arguments: { sql: 'SELECT 1', limit: 10 },
      metadata: { tool_name: 'run_sql' },
    });
    check('Valid args allowed', r.action === 'allow');

    r = await post(6205, {
      config: { strict: true, schemas },
      arguments: { limit: 10 },
      metadata: { tool_name: 'run_sql' },
    });
    check('Missing required field blocked', r.action === 'block');

    r = await post(6205, {
      config: { strict: true, schemas },
      arguments: { sql: 'SELECT 1', limit: 9999 },
      metadata: { tool_name: 'run_sql' },
    });
    check('Out-of-range integer blocked', r.action === 'block');

    r = await post(6205, {
      config: { strict: true, schemas },
      arguments: { sql: 'a'.repeat(200) },
      metadata: { tool_name: 'run_sql' },
    });
    check('Too-long string blocked', r.action === 'block');

    r = await post(6205, {
      config: { strict: true, schemas },
      arguments: {},
      metadata: { tool_name: 'unknown_tool' },
    });
    check('Unknown tool blocked when strict=true', r.action === 'block');

    r = await post(6205, {
      config: { schemas },           // strict not set → default false
      arguments: {},
      metadata: { tool_name: 'unknown_tool' },
    });
    check('Unknown tool allowed by default (strict defaults to false)', r.action === 'allow');

    r = await post(6205, {
      config: { strict: false, schemas },
      arguments: {},
      metadata: { tool_name: 'unknown_tool' },
    });
    check('Unknown tool allowed when strict=false', r.action === 'allow');
  });

  // Schema Validator with live tool discovery
  // Spin up a tiny HTTP mock that pretends to be Project Hub's
  // /api/v1/hub/mcp/<id>/tools endpoint. Then start a fresh
  // schema-validator pointed at it via TOOL_DISCOVERY_BASE.
  await (async () => {
    const mock = http.createServer((req, res) => {
      if (req.method === 'GET' && req.url.startsWith('/api/v1/hub/mcp/')) {
        const tools = [
          {
            name: 'run_sql',
            inputSchema: {
              type: 'object',
              required: ['sql'],
              properties: {
                sql: { type: 'string', maxLength: 50 },
                limit: { type: 'integer', minimum: 1, maximum: 100 },
              },
            },
          },
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ tools }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    await new Promise((r) => mock.listen(6299, r));

    const slug = 'schema-validator';
    const port = 6206;
    const proc = require('child_process').spawn(process.execPath, ['index.js'], {
      cwd: require('path').join(__dirname, '..', 'free', slug),
      env: Object.assign({}, process.env, {
        PORT: String(port),
        TOOL_DISCOVERY_BASE: 'http://127.0.0.1:6299',
        TOOL_CACHE_TTL_MS: '60000',
      }),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    proc.stdout.on('data', () => {});
    proc.stderr.on('data', () => {});

    try {
      await waitFor(port);
      console.log('\nschema-validator (live discovery)');

      let r = await post(port, {
        config: {},
        arguments: { sql: 'SELECT 1' },
        metadata: { tool_name: 'run_sql', target_id: 'mock-deployment' },
      });
      check('Auto-fetched schema accepts valid args', r.action === 'allow');

      r = await post(port, {
        config: {},
        arguments: { sql: 'a'.repeat(200) },
        metadata: { tool_name: 'run_sql', target_id: 'mock-deployment' },
      });
      check('Auto-fetched schema rejects oversized arg', r.action === 'block');

      r = await post(port, {
        config: { strict: true },
        arguments: {},
        metadata: { tool_name: 'unknown_tool', target_id: 'mock-deployment' },
      });
      check('Unknown tool with discovery + strict still blocks', r.action === 'block');
    } finally {
      proc.kill('SIGTERM');
      await new Promise((r) => proc.on('exit', r));
      mock.close();
    }
  })();

  console.log('\n' + (failures === 0 ? 'PASS' : 'FAIL') + ' (' + failures + ' failure' + (failures === 1 ? '' : 's') + ')');
  process.exit(failures === 0 ? 0 : 1);
})().catch((err) => { console.error('FATAL', err); process.exit(1); });
