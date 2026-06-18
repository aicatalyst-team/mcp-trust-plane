# Stripe Data Guard

Provider filter for **Stripe** MCP server integrations.

## Slug

`stripe-data-guard`

## Default port

6348

## Guard rules

### Pre-request (blocked tools)

- `delete_customer`
- `create_refund`
- `cancel_subscription`
- `delete_product`

### Post-response (masked fields)

- `secret_key`
- `api_key`
- `email`
- `card_number`

## Contributing

Improve this filter by:

1. Adding tool names from real Stripe MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
