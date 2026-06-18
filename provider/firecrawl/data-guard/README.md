# Firecrawl Data Guard

Provider filter for **Firecrawl** MCP server integrations.

## Slug

`firecrawl-data-guard`

## Default port

6321

## Guard rules

### Pre-request (blocked tools)

- `delete_crawl`
- `cancel_crawl`

### Post-response (masked fields)

- `api_key`
- `fc-api-key`

## Contributing

Improve this filter by:

1. Adding tool names from real Firecrawl MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
