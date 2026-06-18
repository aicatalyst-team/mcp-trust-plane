# Asana Data Guard

Provider filter for **Asana** MCP server integrations.

## Slug

`asana-data-guard`

## Default port

6302

## Guard rules

### Pre-request (blocked tools)

- `delete_project`
- `delete_task`
- `delete_workspace`

### Post-response (masked fields)

- `email`
- `personal_access_token`
- `phone`

## Contributing

Improve this filter by:

1. Adding tool names from real Asana MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
