/**
 * Exa Search Data Guard — provider filter for Exa Search MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'exa-search-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Exa Search Data Guard',
    blockedTools: [],
    maskedFields: [
  'api_key',
  'x-api-key',
],
    tokenReplacers: [],
  }),
});
