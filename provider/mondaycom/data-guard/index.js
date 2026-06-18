/**
 * Monday.com Data Guard — provider filter for Monday.com MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'mondaycom-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Monday.com Data Guard',
    blockedTools: [
  'delete_board',
  'delete_item',
  'delete_group',
  'delete_workspace',
],
    maskedFields: [
  'api_token',
  'email',
],
    tokenReplacers: [],
  }),
});
