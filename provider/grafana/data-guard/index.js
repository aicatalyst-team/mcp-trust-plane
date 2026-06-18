/**
 * Grafana Data Guard — provider filter for Grafana MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'grafana-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Grafana Data Guard',
    blockedTools: [
  'delete_dashboard',
  'delete_folder',
  'delete_user',
  'delete_org',
],
    maskedFields: [
  'api_key',
  'service_account_token',
  'password',
],
    tokenReplacers: [],
  }),
});
