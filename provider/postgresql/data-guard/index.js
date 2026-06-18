/**
 * PostgreSQL Data Guard — provider filter for PostgreSQL MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'postgresql-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'PostgreSQL Data Guard',
    blockedTools: [
  'drop_table',
  'drop_database',
  'delete',
  'truncate',
  'alter_table',
],
    maskedFields: [
  'password',
  'connection_string',
],
    tokenReplacers: [
  { pattern: new RegExp("postgres(?:ql)?://[^\\s\\\"']+", "g"), replacement: "postgresql://[REDACTED]" },
],
  }),
});
