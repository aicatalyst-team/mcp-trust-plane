/**
 * Slack Data Guard — provider filter for Slack MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'slack-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Slack Data Guard',
    blockedTools: [
  'delete_channel',
  'archive_channel',
  'remove_user',
  'delete_message',
],
    maskedFields: [
  'token',
  'bot_token',
  'user_token',
  'email',
],
    tokenReplacers: [
  { pattern: new RegExp("\\bxox[baprs]-[A-Za-z0-9-]{10,}\\b", "g"), replacement: "xox[REDACTED]" },
],
  }),
});
