# Browserbase Data Guard

Provider filter for **Browserbase** MCP server integrations.

## Slug

`browserbase-data-guard`

## Default port

6309

## Guard rules

### Pre-request (blocked tools)

- `delete_session`
- `delete_project`
- `terminate_session`

### Post-response (masked fields)

- `api_key`
- `project_id`
- `session_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Browserbase MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
