# DuckDuckGo Data Guard

Provider filter for **DuckDuckGo** MCP server integrations.

## Slug

`duckduckgo-data-guard`

## Default port

6316

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `api_key`
- `token`

## Contributing

Improve this filter by:

1. Adding tool names from real DuckDuckGo MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
