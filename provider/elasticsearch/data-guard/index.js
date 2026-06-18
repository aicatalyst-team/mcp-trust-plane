/**
 * Elasticsearch Data Guard — provider filter for Elasticsearch MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'elasticsearch-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Elasticsearch Data Guard',
    blockedTools: [
  'delete_index',
  'delete_document',
  'delete_template',
  'drop_index',
],
    maskedFields: [
  'password',
  'api_key',
  'authorization',
  'credentials',
],
    tokenReplacers: [],
  }),
});
