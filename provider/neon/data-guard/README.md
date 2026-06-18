# Neon Data Guard

Provider filter for **Neon** MCP server integrations.

## Slug

`neon-data-guard`

## Default port

6334

## Guard rules

### Pre-request (blocked tools)

- `delete_project`
- `delete_branch`
- `delete_database`
- `reset_branch`

### Post-response (masked fields)

- `connection_string`
- `password`
- `api_key`

## Contributing

Improve this filter by:

1. Adding tool names from real Neon MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
