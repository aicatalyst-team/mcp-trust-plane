/**
 * PagerDuty Data Guard — provider filter for PagerDuty MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'pagerduty-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'PagerDuty Data Guard',
    blockedTools: [
  'delete_service',
  'delete_escalation_policy',
  'delete_user',
  'delete_schedule',
],
    maskedFields: [
  'routing_key',
  'integration_key',
  'api_key',
  'token',
],
    tokenReplacers: [],
  }),
});
