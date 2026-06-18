# Salesforce Data Guard

Provider filter for **Salesforce** MCP server integrations.

## Slug

`salesforce-data-guard`

## Default port

6344

## Guard rules

### Pre-request (blocked tools)

- `delete_record`
- `delete_sobject`
- `destroy`
- `hard_delete`

### Post-response (masked fields)

- `access_token`
- `refresh_token`
- `session_id`
- `Email`
- `Phone`

## Contributing

Improve this filter by:

1. Adding tool names from real Salesforce MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
