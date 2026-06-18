/**
 * Google Data Guard — provider filter for Google MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'google-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Google Data Guard',
    blockedTools: [
  'delete_file',
  'delete_document',
  'delete_presentation',
  'delete_spreadsheet',
  'delete_permission',
],
    maskedFields: [
  'access_token',
  'refresh_token',
  'client_secret',
  'email',
  'owner_email',
],
    tokenReplacers: [],
  }),
});
