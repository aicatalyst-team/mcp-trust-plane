# Monday.com Data Guard

Provider filter for **Monday.com** MCP server integrations.

## Slug

`mondaycom-data-guard`

## Default port

6330

## Guard rules

### Pre-request (blocked tools)

- `delete_board`
- `delete_item`
- `delete_group`
- `delete_workspace`

### Post-response (masked fields)

- `api_token`
- `email`

## Contributing

Improve this filter by:

1. Adding tool names from real Monday.com MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
