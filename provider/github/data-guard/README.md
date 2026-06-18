# GitHub Data Guard

Provider filter for **GitHub** MCP server integrations.

## Slug

`github-data-guard`

## Default port

6305

## Guard rules

### Pre-request (blocked tools)

- `delete_repository`
- `delete_branch`
- `force_push`

### Post-response (masked fields)

- `email`
- `token`
- `access_token`

## Contributing

Improve this filter by:

1. Adding tool names from real GitHub MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
