# Playwright Data Guard

Provider filter for **Playwright** MCP server integrations.

## Slug

`playwright-data-guard`

## Default port

6340

## Guard rules

### Pre-request (blocked tools)

- `evaluate`
- `execute_script`
- `run_code`
- `shell`
- `download_file`

### Post-response (masked fields)

- `cookie`
- `authorization`
- `local_storage`
- `session_storage`

## Contributing

Improve this filter by:

1. Adding tool names from real Playwright MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
