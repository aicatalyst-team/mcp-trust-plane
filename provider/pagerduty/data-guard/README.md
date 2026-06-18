# PagerDuty Data Guard

Provider filter for **PagerDuty** MCP server integrations.

## Slug

`pagerduty-data-guard`

## Default port

6338

## Guard rules

### Pre-request (blocked tools)

- `delete_service`
- `delete_escalation_policy`
- `delete_user`
- `delete_schedule`

### Post-response (masked fields)

- `routing_key`
- `integration_key`
- `api_key`
- `token`

## Contributing

Improve this filter by:

1. Adding tool names from real PagerDuty MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
