# Confluence Data Guard

Provider filter for **Confluence** MCP server integrations.

## Slug

`confluence-data-guard`

## Default port

6304

## Guard rules

### Pre-request (blocked tools)

- `delete_space`
- `delete_page`
- `export_space`

### Post-response (masked fields)

- `email`
- `author_email`

## Contributing

Improve this filter by:

1. Adding tool names from real Confluence MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
