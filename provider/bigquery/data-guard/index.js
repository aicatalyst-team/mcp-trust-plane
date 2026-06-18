/**
 * BigQuery Data Guard — provider filter for BigQuery MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'bigquery-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'BigQuery Data Guard',
    blockedTools: [
  'delete_dataset',
  'delete_table',
  'delete_model',
  'drop_table',
],
    maskedFields: [
  'private_key',
  'client_email',
  'credentials',
  'service_account',
],
    tokenReplacers: [
  { pattern: new RegExp("-----BEGIN PRIVATE KEY-----[\\s\\S]*?-----END PRIVATE KEY-----", "g"), replacement: "[PRIVATE_KEY_REDACTED]" },
],
  }),
});
