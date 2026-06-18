/**
 * Gmail Data Guard — provider filter for Gmail MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'gmail-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Gmail Data Guard',
    blockedTools: [
  'delete_message',
  'delete_draft',
  'send_message',
  'modify_labels_delete',
],
    maskedFields: [
  'email',
  'from',
  'to',
  'cc',
  'access_token',
  'refresh_token',
],
    tokenReplacers: [],
  }),
});
