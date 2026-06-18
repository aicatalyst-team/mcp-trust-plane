/**
 * Zapier Data Guard — provider filter for Zapier MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'zapier-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Zapier Data Guard',
    blockedTools: [
  'delete_zap',
  'turn_off_zap',
  'delete_hook',
  'delete_app',
],
    maskedFields: [
  'api_key',
  'oauth_token',
  'access_token',
  'email',
],
    tokenReplacers: [],
  }),
});
