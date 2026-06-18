/**
 * Notion Data Guard — provider filter for Notion MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'notion-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Notion Data Guard',
    blockedTools: [
  'delete_page',
  'delete_block',
  'delete_database',
  'archive_page',
],
    maskedFields: [
  'integration_token',
  'token',
  'email',
  'created_by_email',
],
    tokenReplacers: [],
  }),
});
