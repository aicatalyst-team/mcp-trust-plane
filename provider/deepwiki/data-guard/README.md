# DeepWiki Data Guard

Provider filter for **DeepWiki** MCP server integrations.

## Slug

`deepwiki-data-guard`

## Default port

6314

## Guard rules

### Pre-request (blocked tools)

- `delete_repo`
- `delete_index`

### Post-response (masked fields)

- `api_key`
- `token`

## Contributing

Improve this filter by:

1. Adding tool names from real DeepWiki MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
