// Contract test — boots each filter and asserts it obeys the HTTP
// contract documented in docs/CONTRACT.md.
//
// Run with: node tests/contract.js

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const COMMON_FILTERS = [
  { slug: 'sql-guard',        port: 6101, dir: '../common/sql-guard' },
  { slug: 'pii-redactor',     port: 6102, dir: '../common/pii-redactor' },
  { slug: 'row-limiter',      port: 6103, dir: '../common/row-limiter' },
  { slug: 'schema-validator', port: 6105, dir: '../common/schema-validator' },
  { slug: 'rate-limiter',     port: 6107, dir: '../common/rate-limiter' },
  { slug: 'field-masker',     port: 6108, dir: '../common/field-masker' },
];

const PROVIDER_FILTERS = [
  { slug: 'aws-data-guard', port: 6301, dir: '../provider/aws/data-guard' },
  { slug: 'asana-data-guard', port: 6302, dir: '../provider/asana/data-guard' },
  { slug: 'atlassian-data-guard', port: 6303, dir: '../provider/atlassian/data-guard' },
  { slug: 'confluence-data-guard', port: 6304, dir: '../provider/confluence/data-guard' },
  { slug: 'github-data-guard', port: 6305, dir: '../provider/github/data-guard' },
  { slug: 'azure-data-guard', port: 6306, dir: '../provider/azure/data-guard' },
  { slug: 'bigquery-data-guard', port: 6307, dir: '../provider/bigquery/data-guard' },
  { slug: 'brave-search-data-guard', port: 6308, dir: '../provider/brave-search/data-guard' },
  { slug: 'browserbase-data-guard', port: 6309, dir: '../provider/browserbase/data-guard' },
  { slug: 'calendar-data-guard', port: 6310, dir: '../provider/calendar/data-guard' },
  { slug: 'cloudflare-data-guard', port: 6311, dir: '../provider/cloudflare/data-guard' },
  { slug: 'databricks-data-guard', port: 6312, dir: '../provider/databricks/data-guard' },
  { slug: 'datadog-data-guard', port: 6313, dir: '../provider/datadog/data-guard' },
  { slug: 'deepwiki-data-guard', port: 6314, dir: '../provider/deepwiki/data-guard' },
  { slug: 'digitalocean-data-guard', port: 6315, dir: '../provider/digitalocean/data-guard' },
  { slug: 'duckduckgo-data-guard', port: 6316, dir: '../provider/duckduckgo/data-guard' },
  { slug: 'dynatrace-data-guard', port: 6317, dir: '../provider/dynatrace/data-guard' },
  { slug: 'elasticsearch-data-guard', port: 6318, dir: '../provider/elasticsearch/data-guard' },
  { slug: 'exa-search-data-guard', port: 6319, dir: '../provider/exa-search/data-guard' },
  { slug: 'filescom-data-guard', port: 6320, dir: '../provider/filescom/data-guard' },
  { slug: 'firecrawl-data-guard', port: 6321, dir: '../provider/firecrawl/data-guard' },
  { slug: 'gitlab-data-guard', port: 6322, dir: '../provider/gitlab/data-guard' },
  { slug: 'gmail-data-guard', port: 6323, dir: '../provider/gmail/data-guard' },
  { slug: 'google-data-guard', port: 6324, dir: '../provider/google/data-guard' },
  { slug: 'grafana-data-guard', port: 6325, dir: '../provider/grafana/data-guard' },
  { slug: 'hubspot-data-guard', port: 6326, dir: '../provider/hubspot/data-guard' },
  { slug: 'linear-data-guard', port: 6327, dir: '../provider/linear/data-guard' },
  { slug: 'markitdown-data-guard', port: 6328, dir: '../provider/markitdown/data-guard' },
  { slug: 'microsoft-data-guard', port: 6329, dir: '../provider/microsoft/data-guard' },
  { slug: 'mondaycom-data-guard', port: 6330, dir: '../provider/mondaycom/data-guard' },
  { slug: 'mongodb-data-guard', port: 6331, dir: '../provider/mongodb/data-guard' },
  { slug: 'morningstar-data-guard', port: 6332, dir: '../provider/morningstar/data-guard' },
  { slug: 'mysql-data-guard', port: 6333, dir: '../provider/mysql/data-guard' },
  { slug: 'neon-data-guard', port: 6334, dir: '../provider/neon/data-guard' },
  { slug: 'notion-data-guard', port: 6335, dir: '../provider/notion/data-guard' },
  { slug: 'onedrive-data-guard', port: 6336, dir: '../provider/onedrive/data-guard' },
  { slug: 'outlook-data-guard', port: 6337, dir: '../provider/outlook/data-guard' },
  { slug: 'pagerduty-data-guard', port: 6338, dir: '../provider/pagerduty/data-guard' },
  { slug: 'paypal-data-guard', port: 6339, dir: '../provider/paypal/data-guard' },
  { slug: 'playwright-data-guard', port: 6340, dir: '../provider/playwright/data-guard' },
  { slug: 'postgresql-data-guard', port: 6341, dir: '../provider/postgresql/data-guard' },
  { slug: 'postman-data-guard', port: 6342, dir: '../provider/postman/data-guard' },
  { slug: 'redis-data-guard', port: 6343, dir: '../provider/redis/data-guard' },
  { slug: 'salesforce-data-guard', port: 6344, dir: '../provider/salesforce/data-guard' },
  { slug: 'slack-data-guard', port: 6345, dir: '../provider/slack/data-guard' },
  { slug: 'snowflake-data-guard', port: 6346, dir: '../provider/snowflake/data-guard' },
  { slug: 'square-data-guard', port: 6347, dir: '../provider/square/data-guard' },
  { slug: 'stripe-data-guard', port: 6348, dir: '../provider/stripe/data-guard' },
  { slug: 'supabase-data-guard', port: 6349, dir: '../provider/supabase/data-guard' },
  { slug: 'tableau-data-guard', port: 6350, dir: '../provider/tableau/data-guard' },
  { slug: 'tavily-search-data-guard', port: 6351, dir: '../provider/tavily-search/data-guard' },
  { slug: 'terraform-data-guard', port: 6352, dir: '../provider/terraform/data-guard' },
  { slug: 'wordpress-data-guard', port: 6353, dir: '../provider/wordpress/data-guard' },
  { slug: 'zapier-data-guard', port: 6354, dir: '../provider/zapier/data-guard' },
];

const FILTERS = [...COMMON_FILTERS, ...PROVIDER_FILTERS];

let failures = 0;

function check(name, ok, detail) {
  if (ok) {
    console.log('  PASS ' + name);
  } else {
    failures++;
    console.log('  FAIL ' + name + (detail ? ' -- ' + detail : ''));
  }
}

function request(port, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: urlPath,
      method: method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
      timeout: 3000,
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(chunks || '{}'); } catch (e) { parsed = chunks; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

function waitForHealth(port) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const tick = () => {
      tries++;
      request(port, 'GET', '/health')
        .then((r) => (r.status === 200 ? resolve() : retry()))
        .catch(retry);
    };
    const retry = () => {
      if (tries >= 50) return reject(new Error('health check never passed'));
      setTimeout(tick, 100);
    };
    tick();
  });
}

function postRaw(port, urlPath, raw) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: urlPath,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(chunks); } catch (e) { parsed = null; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(raw);
    req.end();
  });
}

async function runFilter(filter) {
  console.log('\n' + filter.slug + ' (port ' + filter.port + ')');
  const proc = spawn(process.execPath, ['index.js'], {
    cwd: path.join(__dirname, filter.dir),
    env: Object.assign({}, process.env, { PORT: String(filter.port) }),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stderr.on('data', () => {});
  proc.stdout.on('data', () => {});

  try {
    await waitForHealth(filter.port);

    const health = await request(filter.port, 'GET', '/health');
    check('GET /health returns 200', health.status === 200);
    check('GET /health body has status=healthy', health.body && health.body.status === 'healthy');
    check('GET /health body identifies the filter', health.body && typeof health.body.filter === 'string');

    const happy = await request(filter.port, 'POST', '/filter', {
      config: {},
      arguments: { sql: 'SELECT 1', response_count: 1, response_rows: ['{"id":1}'] },
      metadata: { agent_id: 'unit-test', tool_name: 'test' },
    });
    check('POST /filter returns 200', happy.status === 200);
    check('POST /filter body has action', happy.body && typeof happy.body.action === 'string');
    const allowed = ['allow', 'block', 'truncate', 'modify'];
    check(
      'POST /filter action is allow/block/truncate/modify',
      happy.body && allowed.indexOf(happy.body.action) >= 0,
      'got: ' + (happy.body && happy.body.action)
    );
    check('POST /filter body has reason', happy.body && typeof happy.body.reason === 'string');

    const garbage = await postRaw(filter.port, '/filter', '{not json');
    check('POST /filter with bad JSON does not crash', garbage.status === 200);
    check('POST /filter with bad JSON fails open', garbage.body && garbage.body.action === 'allow');
  } finally {
    proc.kill('SIGTERM');
    await new Promise((r) => proc.on('exit', r));
  }
}

(async function main() {
  for (const f of FILTERS) {
    try {
      await runFilter(f);
    } catch (err) {
      failures++;
      console.log('  FAIL ' + f.slug + ' crashed: ' + err.message);
    }
  }
  console.log('\n' + (failures === 0 ? 'PASS' : 'FAIL') + ' (' + failures + ' failure' + (failures === 1 ? '' : 's') + ')');
  process.exit(failures === 0 ? 0 : 1);
})();
