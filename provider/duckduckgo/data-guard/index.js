/**
 * DuckDuckGo Data Guard — provider filter for DuckDuckGo MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'duckduckgo-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'DuckDuckGo Data Guard',
    blockedTools: [],
    maskedFields: [
  'api_key',
  'token',
],
    tokenReplacers: [],
  }),
});
