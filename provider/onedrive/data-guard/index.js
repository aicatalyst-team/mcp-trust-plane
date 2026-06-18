/**
 * OneDrive Data Guard — provider filter for OneDrive MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'onedrive-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'OneDrive Data Guard',
    blockedTools: [
  'delete_item',
  'delete_drive',
  'permanent_delete',
  'remove_permission',
],
    maskedFields: [
  'access_token',
  'share_url',
  'webUrl',
  'email',
],
    tokenReplacers: [],
  }),
});
