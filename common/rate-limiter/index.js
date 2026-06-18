/**
 * Rate Limiter Filter
 * Throttles MCP tool calls per agent. Prevents abuse and ensures fair resource allocation.
 * 
 * Contract: POST /filter { config, arguments, metadata }
 * Returns: { action: 'allow'|'block', reason }
 */
const http = require('http');

const PORT = process.env.PORT || 6007;

// In-memory rate tracking (per agent)
const rateBuckets = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, timestamps] of rateBuckets.entries()) {
    const filtered = timestamps.filter(t => now - t < 3600000); // keep last hour
    if (filtered.length === 0) rateBuckets.delete(key);
    else rateBuckets.set(key, filtered);
  }
}

// Cleanup every 5 minutes
setInterval(cleanupOldEntries, 300000);

function handleFilter(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const config = payload.config || {};
      const metadata = payload.metadata || {};

      const maxPerMinute = config.max_per_minute || 30;
      const maxPerHour = config.max_per_hour || 500;
      const scope = config.scope || 'per_agent';

      // Determine the rate-limit key
      let key;
      switch (scope) {
        case 'per_agent': key = metadata.agent_name || metadata.agent_id || 'unknown'; break;
        case 'per_user': key = metadata.user_email || metadata.user_id || 'unknown'; break;
        case 'global': key = 'global'; break;
        default: key = metadata.agent_name || 'unknown';
      }

      const now = Date.now();
      const timestamps = rateBuckets.get(key) || [];
      timestamps.push(now);
      rateBuckets.set(key, timestamps);

      // Check per-minute limit. The check uses ">" so the configured
      // value is the maximum (e.g. max=3 means 3 calls allowed). The
      // current request is already pushed onto timestamps above, so a
      // strict ">" comparison gives the right boundary.
      const lastMinute = timestamps.filter(t => now - t < 60000);
      if (lastMinute.length > maxPerMinute) {
        return respond(res, {
          action: 'block',
          reason: `Rate limit exceeded: ${lastMinute.length}/${maxPerMinute} calls per minute for ${scope} '${key}'`
        });
      }

      // Check per-hour limit
      const lastHour = timestamps.filter(t => now - t < 3600000);
      if (lastHour.length > maxPerHour) {
        return respond(res, {
          action: 'block',
          reason: `Rate limit exceeded: ${lastHour.length}/${maxPerHour} calls per hour for ${scope} '${key}'`
        });
      }

      respond(res, {
        action: 'allow',
        reason: `Rate OK: ${lastMinute.length}/${maxPerMinute} per min, ${lastHour.length}/${maxPerHour} per hour`
      });
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
    respond(res, { status: 'healthy', filter: 'rate-limiter', version: '1.0.0' });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Rate Limiter filter running on port ${PORT}`);
});
