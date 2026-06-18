# PayPal Data Guard

Provider filter for **PayPal** MCP server integrations.

## Slug

`paypal-data-guard`

## Default port

6339

## Guard rules

### Pre-request (blocked tools)

- `create_refund`
- `capture_refund`
- `delete_webhook`
- `cancel_subscription`

### Post-response (masked fields)

- `client_secret`
- `access_token`
- `payer_email`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real PayPal MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
