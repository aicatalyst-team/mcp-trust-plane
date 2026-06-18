# Brave Search Data Guard

Provider filter for **Brave Search** MCP server integrations.

## Slug

`brave-search-data-guard`

## Default port

6308

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `api_key`
- `subscription_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Brave Search MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
