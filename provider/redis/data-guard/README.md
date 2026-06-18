# Redis Data Guard

Provider filter for **Redis** MCP server integrations.

## Slug

`redis-data-guard`

## Default port

6343

## Guard rules

### Pre-request (blocked tools)

- `flushall`
- `flushdb`
- `del`
- `delete`
- `config_set`

### Post-response (masked fields)

- `password`
- `auth`
- `connection_string`

## Contributing

Improve this filter by:

1. Adding tool names from real Redis MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
