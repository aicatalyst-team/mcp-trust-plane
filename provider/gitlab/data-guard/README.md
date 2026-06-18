# GitLab Data Guard

Provider filter for **GitLab** MCP server integrations.

## Slug

`gitlab-data-guard`

## Default port

6322

## Guard rules

### Pre-request (blocked tools)

- `delete_project`
- `delete_branch`
- `delete_repository`
- `remove_member`

### Post-response (masked fields)

- `email`
- `private_token`
- `access_token`

## Contributing

Improve this filter by:

1. Adding tool names from real GitLab MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
