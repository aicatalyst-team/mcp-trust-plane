# Files.com Data Guard

Provider filter for **Files.com** MCP server integrations.

## Slug

`filescom-data-guard`

## Default port

6320

## Guard rules

### Pre-request (blocked tools)

- `delete_file`
- `delete_folder`
- `delete_user`
- `purge`

### Post-response (masked fields)

- `api_key`
- `password`
- `sftp_password`

## Contributing

Improve this filter by:

1. Adding tool names from real Files.com MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
