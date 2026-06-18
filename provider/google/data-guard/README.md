# Google Data Guard

Provider filter for **Google** MCP server integrations.

## Slug

`google-data-guard`

## Default port

6324

## Guard rules

### Pre-request (blocked tools)

- `delete_file`
- `delete_document`
- `delete_presentation`
- `delete_spreadsheet`
- `delete_permission`

### Post-response (masked fields)

- `access_token`
- `refresh_token`
- `client_secret`
- `email`
- `owner_email`

## Contributing

Improve this filter by:

1. Adding tool names from real Google MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
