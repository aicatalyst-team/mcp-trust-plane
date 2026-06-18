/**
 * Files.com Data Guard — provider filter for Files.com MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'filescom-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Files.com Data Guard',
    blockedTools: [
  'delete_file',
  'delete_folder',
  'delete_user',
  'purge',
],
    maskedFields: [
  'api_key',
  'password',
  'sftp_password',
],
    tokenReplacers: [],
  }),
});
