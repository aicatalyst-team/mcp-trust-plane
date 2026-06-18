# Atlassian Data Guard

Provider filter for **Atlassian** MCP server integrations.

## Slug

`atlassian-data-guard`

## Default port

6303

## Guard rules

### Pre-request (blocked tools)

- `delete_issue`
- `delete_project`
- `remove_permission`

### Post-response (masked fields)

- `emailAddress`
- `accountId`
- `api_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Atlassian MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
