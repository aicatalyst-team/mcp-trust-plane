/**
 * Postman Data Guard — provider filter for Postman MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'postman-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Postman Data Guard',
    blockedTools: [
  'delete_collection',
  'delete_environment',
  'delete_workspace',
],
    maskedFields: [
  'api_key',
  'access_token',
  'x-api-key',
],
    tokenReplacers: [],
  }),
});
