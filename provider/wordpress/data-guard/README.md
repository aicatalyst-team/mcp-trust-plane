# WordPress Data Guard

Provider filter for **WordPress** MCP server integrations.

## Slug

`wordpress-data-guard`

## Default port

6353

## Guard rules

### Pre-request (blocked tools)

- `delete_post`
- `delete_user`
- `delete_plugin`
- `delete_theme`
- `drop_table`

### Post-response (masked fields)

- `application_password`
- `password`
- `email`
- `auth_token`

## Contributing

Improve this filter by:

1. Adding tool names from real WordPress MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
