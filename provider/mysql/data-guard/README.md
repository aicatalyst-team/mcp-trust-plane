# MySQL Data Guard

Provider filter for **MySQL** MCP server integrations.

## Slug

`mysql-data-guard`

## Default port

6333

## Guard rules

### Pre-request (blocked tools)

- `drop_table`
- `drop_database`
- `delete`
- `truncate`
- `alter_table`

### Post-response (masked fields)

- `password`
- `connection_string`

## Contributing

Improve this filter by:

1. Adding tool names from real MySQL MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
