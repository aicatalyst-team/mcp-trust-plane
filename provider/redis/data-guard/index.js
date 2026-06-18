/**
 * Redis Data Guard — provider filter for Redis MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'redis-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Redis Data Guard',
    blockedTools: [
  'flushall',
  'flushdb',
  'del',
  'delete',
  'config_set',
],
    maskedFields: [
  'password',
  'auth',
  'connection_string',
],
    tokenReplacers: [],
  }),
});
