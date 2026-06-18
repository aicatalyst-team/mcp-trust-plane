# Databricks Data Guard

Provider filter for **Databricks** MCP server integrations.

## Slug

`databricks-data-guard`

## Default port

6312

## Guard rules

### Pre-request (blocked tools)

- `delete_cluster`
- `delete_job`
- `delete_workspace`
- `terminate_cluster`

### Post-response (masked fields)

- `token`
- `pat`
- `personal_access_token`
- `connection_string`

## Contributing

Improve this filter by:

1. Adding tool names from real Databricks MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
