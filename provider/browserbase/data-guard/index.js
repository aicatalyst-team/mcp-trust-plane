/**
 * Browserbase Data Guard — provider filter for Browserbase MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'browserbase-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Browserbase Data Guard',
    blockedTools: [
  'delete_session',
  'delete_project',
  'terminate_session',
],
    maskedFields: [
  'api_key',
  'project_id',
  'session_token',
],
    tokenReplacers: [],
  }),
});
