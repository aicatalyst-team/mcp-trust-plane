# DigitalOcean Data Guard

Provider filter for **DigitalOcean** MCP server integrations.

## Slug

`digitalocean-data-guard`

## Default port

6315

## Guard rules

### Pre-request (blocked tools)

- `delete_droplet`
- `delete_database`
- `delete_domain`
- `delete_firewall`

### Post-response (masked fields)

- `token`
- `access_token`
- `secret`

## Contributing

Improve this filter by:

1. Adding tool names from real DigitalOcean MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
