# Postman Data Guard

Provider filter for **Postman** MCP server integrations.

## Slug

`postman-data-guard`

## Default port

6342

## Guard rules

### Pre-request (blocked tools)

- `delete_collection`
- `delete_environment`
- `delete_workspace`

### Post-response (masked fields)

- `api_key`
- `access_token`
- `x-api-key`

## Contributing

Improve this filter by:

1. Adding tool names from real Postman MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
