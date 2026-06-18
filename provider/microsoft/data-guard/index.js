/**
 * Microsoft Data Guard — provider filter for Microsoft MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'microsoft-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Microsoft Data Guard',
    blockedTools: [
  'delete_item',
  'delete_user',
  'delete_group',
  'delete_mailbox',
  'remove_member',
],
    maskedFields: [
  'access_token',
  'refresh_token',
  'client_secret',
  'mail',
  'userPrincipalName',
],
    tokenReplacers: [],
  }),
});
