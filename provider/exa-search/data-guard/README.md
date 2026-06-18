# Exa Search Data Guard

Provider filter for **Exa Search** MCP server integrations.

## Slug

`exa-search-data-guard`

## Default port

6319

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `api_key`
- `x-api-key`

## Contributing

Improve this filter by:

1. Adding tool names from real Exa Search MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
