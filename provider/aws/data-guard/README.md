# AWS Data Guard

Provider filter for **AWS** MCP server integrations.

## Slug

`aws-data-guard`

## Default port

6301

## Guard rules

### Pre-request (blocked tools)

- `delete_bucket`
- `delete_user`
- `terminate_instances`
- `delete_db_instance`

### Post-response (masked fields)

- `SecretAccessKey`
- `SessionToken`
- `access_key_id`

## Contributing

Improve this filter by:

1. Adding tool names from real AWS MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
