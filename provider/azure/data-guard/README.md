# Azure Data Guard

Provider filter for **Azure** MCP server integrations.

## Slug

`azure-data-guard`

## Default port

6306

## Guard rules

### Pre-request (blocked tools)

- `delete_resource_group`
- `delete_storage_account`
- `delete_key_vault`
- `delete_sql_server`
- `purge_key`

### Post-response (masked fields)

- `client_secret`
- `subscription_key`
- `connection_string`
- `access_token`
- `tenant_secret`

## Contributing

Improve this filter by:

1. Adding tool names from real Azure MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
