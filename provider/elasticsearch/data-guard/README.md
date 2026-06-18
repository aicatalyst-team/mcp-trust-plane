# Elasticsearch Data Guard

Provider filter for **Elasticsearch** MCP server integrations.

## Slug

`elasticsearch-data-guard`

## Default port

6318

## Guard rules

### Pre-request (blocked tools)

- `delete_index`
- `delete_document`
- `delete_template`
- `drop_index`

### Post-response (masked fields)

- `password`
- `api_key`
- `authorization`
- `credentials`

## Contributing

Improve this filter by:

1. Adding tool names from real Elasticsearch MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
