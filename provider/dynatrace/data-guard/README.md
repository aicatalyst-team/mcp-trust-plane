# Dynatrace Data Guard

Provider filter for **Dynatrace** MCP server integrations.

## Slug

`dynatrace-data-guard`

## Default port

6317

## Guard rules

### Pre-request (blocked tools)

- `delete_monitor`
- `delete_application`
- `delete_environment`

### Post-response (masked fields)

- `api_token`
- `access_token`
- `tenant_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Dynatrace MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
