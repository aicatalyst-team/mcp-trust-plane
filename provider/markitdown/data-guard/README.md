# MarkItDown Data Guard

Provider filter for **MarkItDown** MCP server integrations.

## Slug

`markitdown-data-guard`

## Default port

6328

## Guard rules

### Pre-request (blocked tools)

- _(none yet — contributions welcome)_

### Post-response (masked fields)

- `path`
- `file_path`
- `local_path`

## Contributing

Improve this filter by:

1. Adding tool names from real MarkItDown MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
