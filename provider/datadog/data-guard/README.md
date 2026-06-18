# Datadog Data Guard

Provider filter for **Datadog** MCP server integrations.

## Slug

`datadog-data-guard`

## Default port

6313

## Guard rules

### Pre-request (blocked tools)

- `delete_monitor`
- `delete_dashboard`
- `delete_user`
- `mute_all`

### Post-response (masked fields)

- `api_key`
- `app_key`
- `application_key`

## Contributing

Improve this filter by:

1. Adding tool names from real Datadog MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
