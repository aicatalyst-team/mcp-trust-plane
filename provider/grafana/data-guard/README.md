# Grafana Data Guard

Provider filter for **Grafana** MCP server integrations.

## Slug

`grafana-data-guard`

## Default port

6325

## Guard rules

### Pre-request (blocked tools)

- `delete_dashboard`
- `delete_folder`
- `delete_user`
- `delete_org`

### Post-response (masked fields)

- `api_key`
- `service_account_token`
- `password`

## Contributing

Improve this filter by:

1. Adding tool names from real Grafana MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
