# Linear Data Guard

Provider filter for **Linear** MCP server integrations.

## Slug

`linear-data-guard`

## Default port

6327

## Guard rules

### Pre-request (blocked tools)

- `delete_issue`
- `delete_project`
- `delete_team`
- `archive_issue`

### Post-response (masked fields)

- `api_key`
- `email`
- `assignee_email`

## Contributing

Improve this filter by:

1. Adding tool names from real Linear MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
