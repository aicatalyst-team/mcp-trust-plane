# Microsoft Data Guard

Provider filter for **Microsoft** MCP server integrations.

## Slug

`microsoft-data-guard`

## Default port

6329

## Guard rules

### Pre-request (blocked tools)

- `delete_item`
- `delete_user`
- `delete_group`
- `delete_mailbox`
- `remove_member`

### Post-response (masked fields)

- `access_token`
- `refresh_token`
- `client_secret`
- `mail`
- `userPrincipalName`

## Contributing

Improve this filter by:

1. Adding tool names from real Microsoft MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
