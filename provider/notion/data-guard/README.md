# Notion Data Guard

Provider filter for **Notion** MCP server integrations.

## Slug

`notion-data-guard`

## Default port

6335

## Guard rules

### Pre-request (blocked tools)

- `delete_page`
- `delete_block`
- `delete_database`
- `archive_page`

### Post-response (masked fields)

- `integration_token`
- `token`
- `email`
- `created_by_email`

## Contributing

Improve this filter by:

1. Adding tool names from real Notion MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
