/**
 * Datadog Data Guard — provider filter for Datadog MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'datadog-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Datadog Data Guard',
    blockedTools: [
  'delete_monitor',
  'delete_dashboard',
  'delete_user',
  'mute_all',
],
    maskedFields: [
  'api_key',
  'app_key',
  'application_key',
],
    tokenReplacers: [],
  }),
});
