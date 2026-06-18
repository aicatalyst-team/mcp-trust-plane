/**
 * Minimal HTTP server bootstrap shared by provider-specific filters.
 */
const http = require('http');

function respond(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function createFilterServer({ slug, version = '1.0.0', evaluate }) {
  const PORT = process.env.PORT || 6300;

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/filter') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          respond(res, evaluate(
            payload.arguments || {},
            payload.config || {},
            payload.metadata || {},
          ));
        } catch (err) {
          respond(res, { action: 'allow', reason: `Filter error: ${err.message}` });
        }
      });
      return;
    }

    if (req.url === '/health') {
      respond(res, { status: 'healthy', filter: slug, version });
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(PORT, () => {
    console.log(`${slug} filter running on port ${PORT}`);
  });

  return server;
}

module.exports = { createFilterServer, respond };
