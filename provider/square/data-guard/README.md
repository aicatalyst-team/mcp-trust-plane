# Square Data Guard

Provider filter for **Square** MCP server integrations.

## Slug

`square-data-guard`

## Default port

6347

## Guard rules

### Pre-request (blocked tools)

- `delete_customer`
- `delete_payment`
- `refund_payment`
- `delete_catalog`

### Post-response (masked fields)

- `access_token`
- `application_secret`
- `email`
- `phone_number`

## Contributing

Improve this filter by:

1. Adding tool names from real Square MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
