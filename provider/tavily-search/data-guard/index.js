/**
 * Tavily Search Data Guard — provider filter for Tavily Search MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'tavily-search-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Tavily Search Data Guard',
    blockedTools: [],
    maskedFields: [
  'api_key',
  'tavily_api_key',
],
    tokenReplacers: [],
  }),
});
