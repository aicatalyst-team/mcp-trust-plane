/**
 * Neon Data Guard — provider filter for Neon MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'neon-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Neon Data Guard',
    blockedTools: [
  'delete_project',
  'delete_branch',
  'delete_database',
  'reset_branch',
],
    maskedFields: [
  'connection_string',
  'password',
  'api_key',
],
    tokenReplacers: [],
  }),
});
