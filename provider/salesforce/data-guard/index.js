/**
 * Salesforce Data Guard — provider filter for Salesforce MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'salesforce-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Salesforce Data Guard',
    blockedTools: [
  'delete_record',
  'delete_sobject',
  'destroy',
  'hard_delete',
],
    maskedFields: [
  'access_token',
  'refresh_token',
  'session_id',
  'Email',
  'Phone',
],
    tokenReplacers: [],
  }),
});
