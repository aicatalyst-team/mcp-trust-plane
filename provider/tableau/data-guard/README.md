# Tableau Data Guard

Provider filter for **Tableau** MCP server integrations.

## Slug

`tableau-data-guard`

## Default port

6350

## Guard rules

### Pre-request (blocked tools)

- `delete_workbook`
- `delete_datasource`
- `delete_project`
- `delete_user`

### Post-response (masked fields)

- `personal_access_token`
- `password`
- `secret`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real Tableau MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
