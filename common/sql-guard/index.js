/**
 * SQL Guard Filter
 *
 * Pre-request filter that inspects the SQL string in the tool-call
 * arguments and decides whether to allow or block it. Three layers:
 *
 *   1. allow_only — if non-empty, only those statement types pass.
 *      Examples: ["SELECT"], ["SELECT", "WITH"].
 *   2. blocked_statements — names that must NOT appear as the leading
 *      keyword of any statement in the SQL.
 *   3. block_comments — when true, reject SQL containing line ('--')
 *      or block ('/*') comments. Defaults to true.
 *
 * The check is statement-aware: we split on ';' and inspect each piece's
 * leading keyword via a word-boundary regex so a column named "delete_at"
 * does not trip the DELETE rule.
 */
const http = require('http');

const PORT = process.env.PORT || 6001;
const DEFAULT_BLOCKED = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE'];

function leadingKeyword(stmt) {
  const m = stmt.trim().match(/^([A-Za-z]+)\b/);
  return m ? m[1].toUpperCase() : '';
}

function statementContainsKeyword(stmt, keyword) {
  // Word-boundary match anywhere in the statement, case-insensitive.
  const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return re.test(stmt);
}

function evaluate(sql, config) {
  if (!sql || typeof sql !== 'string' || !sql.trim()) {
    return { action: 'allow', reason: 'No SQL detected' };
  }

  const blockComments = config.block_comments !== false;
  if (blockComments) {
    if (/--/.test(sql) || /\/\*/.test(sql)) {
      return { action: 'block', reason: 'SQL comments are not permitted (potential injection)' };
    }
  }

  const blocked = (config.blocked_statements || DEFAULT_BLOCKED).map((s) => s.toUpperCase());
  const allowOnly = (config.allow_only || []).map((s) => s.toUpperCase());

  const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    const head = leadingKeyword(stmt);
    if (allowOnly.length && !allowOnly.includes(head)) {
      return {
        action: 'block',
        reason: `Statement type '${head || 'unknown'}' is not allowed. Only: ${allowOnly.join(', ')}`,
      };
    }
    for (const kw of blocked) {
      if (statementContainsKeyword(stmt, kw)) {
        return {
          action: 'block',
          reason: `Blocked: SQL contains '${kw}'`,
        };
      }
    }
  }

  return { action: 'allow', reason: 'SQL validated successfully' };
}

function handleFilter(req, res) {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const config = payload.config || {};
      const args = payload.arguments || {};
      const sql = args.sql || args.statement || args.query || '';
      respond(res, evaluate(sql, config));
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
    respond(res, { status: 'healthy', filter: 'sql-guard', version: '1.1.0' });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`SQL Guard filter running on port ${PORT}`);
});
