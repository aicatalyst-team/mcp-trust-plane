# Snowflake Data Guard

Provider filter for **Snowflake** MCP server integrations.

## Slug

`snowflake-data-guard`

## Default port

6346

## Guard rules

### Pre-request (blocked tools)

- `drop_warehouse`
- `drop_database`
- `drop_schema`
- `drop_table`
- `delete`

### Post-response (masked fields)

- `password`
- `private_key`
- `connection_string`
- `token`

## Contributing

Improve this filter by:

1. Adding tool names from real Snowflake MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
