# Supabase Data Guard

Provider filter for **Supabase** MCP server integrations.

## Slug

`supabase-data-guard`

## Default port

6349

## Guard rules

### Pre-request (blocked tools)

- `delete_project`
- `delete_branch`
- `drop_table`
- `delete_user`

### Post-response (masked fields)

- `service_role_key`
- `anon_key`
- `connection_string`
- `password`

## Contributing

Improve this filter by:

1. Adding tool names from real Supabase MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
