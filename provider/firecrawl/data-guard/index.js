/**
 * Firecrawl Data Guard — provider filter for Firecrawl MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'firecrawl-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Firecrawl Data Guard',
    blockedTools: [
  'delete_crawl',
  'cancel_crawl',
],
    maskedFields: [
  'api_key',
  'fc-api-key',
],
    tokenReplacers: [],
  }),
});
