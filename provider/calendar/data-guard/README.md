# Google Calendar Data Guard

Provider filter for **Google Calendar** MCP server integrations.

## Slug

`calendar-data-guard`

## Default port

6310

## Guard rules

### Pre-request (blocked tools)

- `delete_event`
- `delete_calendar`
- `clear_calendar`

### Post-response (masked fields)

- `email`
- `attendee_email`
- `organizer_email`
- `access_token`

## Contributing

Improve this filter by:

1. Adding tool names from real Google Calendar MCP servers to `blockedTools` in `index.js`.
2. Extending `maskedFields` / `tokenReplacers` for provider-specific secrets.
3. Adding behaviour tests under `tests/provider/` (future).

See `../../README.md` and `../../../docs/ADDING_FILTERS.md`.
