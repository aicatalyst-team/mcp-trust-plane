/**
 * Azure Data Guard — provider filter for Azure MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'azure-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Azure Data Guard',
    blockedTools: [
  'delete_resource_group',
  'delete_storage_account',
  'delete_key_vault',
  'delete_sql_server',
  'purge_key',
],
    maskedFields: [
  'client_secret',
  'subscription_key',
  'connection_string',
  'access_token',
  'tenant_secret',
],
    tokenReplacers: [
  { pattern: new RegExp("\\b[A-Za-z0-9+/]{86}==\\b", "g"), replacement: "[AZURE_SECRET_REDACTED]" },
],
  }),
});
