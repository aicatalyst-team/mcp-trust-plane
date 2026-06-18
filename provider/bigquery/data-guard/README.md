# BigQuery Data Guard

Provider filter for **BigQuery** MCP server integrations.

## Slug

`bigquery-data-guard`

## Default port

6307

## Guard rules

### Pre-request (blocked tools)

- `delete_dataset`
- `delete_table`
- `delete_model`
- `drop_table`

### Post-response (masked fields)

- `private_key`
- `client_email`
- `credentials`
- `service_account`

## Contributing

Improve this filter by:

1. Adding tool names from real BigQuery MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
