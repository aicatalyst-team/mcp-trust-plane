# Writing Your Own Filter

A filter is a standalone HTTP service. Pick any language, expose
`POST /filter` and `GET /health`, and you're done.

## Skeleton (Node.js)

```js
const http = require('http');

const PORT = process.env.PORT || 6010;

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/filter') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      try {
        const { config, arguments: args, metadata } = JSON.parse(body);
        // Inspect args / metadata. Decide:
        const decision = decide(config, args, metadata);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(decision));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ action: 'allow', reason: err.message }));
      }
    });
    return;
  }
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', filter: 'my-filter', version: '0.1.0' }));
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(PORT, () => console.log(`my-filter listening on ${PORT}`));

function decide(config, args, metadata) {
  // Replace with real logic.
  return { action: 'allow', reason: 'OK' };
}
```

## Skeleton (Python / FastAPI)

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Req(BaseModel):
    config:    dict
    arguments: dict
    metadata:  dict

@app.post("/filter")
def filter_(req: Req) -> dict:
    return {"action": "allow", "reason": "OK"}

@app.get("/health")
def health() -> dict:
    return {"status": "healthy", "filter": "my-filter", "version": "0.1.0"}
```

## Registering the filter

Once running, insert a row in `ablv_mcp_filters`:

```sql
INSERT INTO ablv_mcp_filters
  (name, slug, description, category, filter_url,
   execution_point, default_config, config_schema, is_premium)
VALUES
  ('My Filter', 'my-filter', 'Does something useful',
   'security',
   'http://my-filter:6010/filter',
   'pre-request',
   '{}'::jsonb, '{}'::jsonb,
   false);
```

Add the filter to a policy via the Project Hub UI or the API, then
assign that policy to a target (`global`, `mcp_server`, `agent`, or
`project`).

## Testing

The repo ships a contract test under `tests/`:

```sh
cd tests && npm test
```

This boots each filter in `common/` and `provider/` and asserts that:

1. `/health` returns 200 with `{ status: "healthy" }`.
2. `/filter` accepts the canonical request shape.
3. The response includes `action` and `reason`.
4. Invalid input returns `action: allow` (fail-open).

To plug your own filter into the suite, add it to
`tests/contract.js` under the `FILTERS` array.

## Conventions

- One process per filter. Don't multiplex multiple filters in one
  binary — it defeats the independent deploy story.
- Use `process.env.PORT` (or the equivalent) so orchestrators can
  override.
- Log to stdout. Structure logs as JSON if you can.
- Keep config schemas small. The fewer knobs, the easier to reason
  about. Surface the schema via `config_schema` so the UI can
  auto-generate forms.
- Fail open. If you can't decide, return `allow` with a `reason` that
  describes why.
