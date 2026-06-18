/**
 * Databricks Data Guard — provider filter for Databricks MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'databricks-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Databricks Data Guard',
    blockedTools: [
  'delete_cluster',
  'delete_job',
  'delete_workspace',
  'terminate_cluster',
],
    maskedFields: [
  'token',
  'pat',
  'personal_access_token',
  'connection_string',
],
    tokenReplacers: [],
  }),
});
