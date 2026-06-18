/**
 * Brave Search Data Guard — provider filter for Brave Search MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'brave-search-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Brave Search Data Guard',
    blockedTools: [],
    maskedFields: [
  'api_key',
  'subscription_token',
],
    tokenReplacers: [
  { pattern: new RegExp("\\bBSA[A-Za-z0-9_-]{20,}\\b", "g"), replacement: "BSA[REDACTED]" },
],
  }),
});
