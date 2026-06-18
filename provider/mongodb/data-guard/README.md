# MongoDB Data Guard

Provider filter for **MongoDB** MCP server integrations.

## Slug

`mongodb-data-guard`

## Default port

6331

## Guard rules

### Pre-request (blocked tools)

- `drop_database`
- `drop_collection`
- `delete_many`
- `drop_index`

### Post-response (masked fields)

- `connection_string`
- `password`
- `uri`

## Contributing

Improve this filter by:

1. Adding tool names from real MongoDB MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
