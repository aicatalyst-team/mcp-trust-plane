/**
 * Snowflake Data Guard — provider filter for Snowflake MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'snowflake-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Snowflake Data Guard',
    blockedTools: [
  'drop_warehouse',
  'drop_database',
  'drop_schema',
  'drop_table',
  'delete',
],
    maskedFields: [
  'password',
  'private_key',
  'connection_string',
  'token',
],
    tokenReplacers: [],
  }),
});
