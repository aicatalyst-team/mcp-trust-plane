# Gmail Data Guard

Provider filter for **Gmail** MCP server integrations.

## Slug

`gmail-data-guard`

## Default port

6323

## Guard rules

### Pre-request (blocked tools)

- `delete_message`
- `delete_draft`
- `send_message`
- `modify_labels_delete`

### Post-response (masked fields)

- `email`
- `from`
- `to`
- `cc`
- `access_token`
- `refresh_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Gmail MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
