# Terraform Data Guard

Provider filter for **Terraform** MCP server integrations.

## Slug

`terraform-data-guard`

## Default port

6352

## Guard rules

### Pre-request (blocked tools)

- `destroy`
- `apply`
- `force_unlock`
- `delete_workspace`

### Post-response (masked fields)

- `token`
- `api_token`
- `sensitive`
- `password`

## Contributing

Improve this filter by:

1. Adding tool names from real Terraform MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
