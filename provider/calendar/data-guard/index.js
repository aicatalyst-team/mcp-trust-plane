/**
 * Google Calendar Data Guard — provider filter for Google Calendar MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'calendar-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Google Calendar Data Guard',
    blockedTools: [
  'delete_event',
  'delete_calendar',
  'clear_calendar',
],
    maskedFields: [
  'email',
  'attendee_email',
  'organizer_email',
  'access_token',
],
    tokenReplacers: [],
  }),
});
