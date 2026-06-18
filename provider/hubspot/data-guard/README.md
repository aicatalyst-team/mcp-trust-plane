# HubSpot Data Guard

Provider filter for **HubSpot** MCP server integrations.

## Slug

`hubspot-data-guard`

## Default port

6326

## Guard rules

### Pre-request (blocked tools)

- `delete_contact`
- `delete_company`
- `delete_deal`
- `delete_ticket`

### Post-response (masked fields)

- `access_token`
- `refresh_token`
- `email`
- `hs_email`

## Contributing

Improve this filter by:

1. Adding tool names from real HubSpot MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
