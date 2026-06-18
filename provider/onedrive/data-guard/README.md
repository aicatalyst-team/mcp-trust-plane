# OneDrive Data Guard

Provider filter for **OneDrive** MCP server integrations.

## Slug

`onedrive-data-guard`

## Default port

6336

## Guard rules

### Pre-request (blocked tools)

- `delete_item`
- `delete_drive`
- `permanent_delete`
- `remove_permission`

### Post-response (masked fields)

- `access_token`
- `share_url`
- `webUrl`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real OneDrive MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
