# Tavily Search Data Guard

Provider filter for **Tavily Search** MCP server integrations.

## Slug

`tavily-search-data-guard`

## Default port

6351

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `api_key`
- `tavily_api_key`

## Contributing

Improve this filter by:

1. Adding tool names from real Tavily Search MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
