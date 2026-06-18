/**
 * Morningstar Data Guard — provider filter for Morningstar MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'morningstar-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Morningstar Data Guard',
    blockedTools: [],
    maskedFields: [
  'api_key',
  'client_id',
  'client_secret',
  'access_token',
],
    tokenReplacers: [],
  }),
});
