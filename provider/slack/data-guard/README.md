# Slack Data Guard

Provider filter for **Slack** MCP server integrations.

## Slug

`slack-data-guard`

## Default port

6345

## Guard rules

### Pre-request (blocked tools)

- `delete_channel`
- `archive_channel`
- `remove_user`
- `delete_message`

### Post-response (masked fields)

- `token`
- `bot_token`
- `user_token`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real Slack MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
