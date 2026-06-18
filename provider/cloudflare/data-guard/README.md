# Cloudflare Data Guard

Provider filter for **Cloudflare** MCP server integrations.

## Slug

`cloudflare-data-guard`

## Default port

6311

## Guard rules

### Pre-request (blocked tools)

- `delete_zone`
- `purge_cache`
- `delete_dns_record`
- `delete_worker`

### Post-response (masked fields)

- `api_token`
- `api_key`
- `origin_ca_key`

## Contributing

Improve this filter by:

1. Adding tool names from real Cloudflare MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
