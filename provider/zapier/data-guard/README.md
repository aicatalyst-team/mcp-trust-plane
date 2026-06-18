# Zapier Data Guard

Provider filter for **Zapier** MCP server integrations.

## Slug

`zapier-data-guard`

## Default port

6354

## Guard rules

### Pre-request (blocked tools)

- `delete_zap`
- `turn_off_zap`
- `delete_hook`
- `delete_app`

### Post-response (masked fields)

- `api_key`
- `oauth_token`
- `access_token`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real Zapier MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
