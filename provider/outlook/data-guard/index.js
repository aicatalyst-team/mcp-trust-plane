/**
 * Outlook Data Guard — provider filter for Outlook MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'outlook-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Outlook Data Guard',
    blockedTools: [
  'delete_message',
  'delete_event',
  'send_mail',
  'move_to_deleted',
],
    maskedFields: [
  'access_token',
  'email',
  'from',
  'to',
  'cc',
],
    tokenReplacers: [],
  }),
});
