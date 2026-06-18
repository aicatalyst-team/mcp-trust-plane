/**
 * WordPress Data Guard — provider filter for WordPress MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'wordpress-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'WordPress Data Guard',
    blockedTools: [
  'delete_post',
  'delete_user',
  'delete_plugin',
  'delete_theme',
  'drop_table',
],
    maskedFields: [
  'application_password',
  'password',
  'email',
  'auth_token',
],
    tokenReplacers: [],
  }),
});
