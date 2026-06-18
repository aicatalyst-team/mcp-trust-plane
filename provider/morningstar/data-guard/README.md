# Morningstar Data Guard

Provider filter for **Morningstar** MCP server integrations.

## Slug

`morningstar-data-guard`

## Default port

6332

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `api_key`
- `client_id`
- `client_secret`
- `access_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Morningstar MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
