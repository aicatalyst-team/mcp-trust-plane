/**
 * DeepWiki Data Guard — provider filter for DeepWiki MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'deepwiki-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'DeepWiki Data Guard',
    blockedTools: [
  'delete_repo',
  'delete_index',
],
    maskedFields: [
  'api_key',
  'token',
],
    tokenReplacers: [],
  }),
});
