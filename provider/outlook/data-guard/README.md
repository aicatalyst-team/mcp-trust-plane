# Outlook Data Guard

Provider filter for **Outlook** MCP server integrations.

## Slug

`outlook-data-guard`

## Default port

6337

## Guard rules

### Pre-request (blocked tools)

- `delete_message`
- `delete_event`
- `send_mail`
- `move_to_deleted`

### Post-response (masked fields)

- `access_token`
- `email`
- `from`
- `to`
- `cc`

## Contributing

Improve this filter by:

1. Adding tool names from real Outlook MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
