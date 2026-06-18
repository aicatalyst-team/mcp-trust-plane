/**
 * Dynatrace Data Guard — provider filter for Dynatrace MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'dynatrace-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Dynatrace Data Guard',
    blockedTools: [
  'delete_monitor',
  'delete_application',
  'delete_environment',
],
    maskedFields: [
  'api_token',
  'access_token',
  'tenant_token',
],
    tokenReplacers: [],
  }),
});
