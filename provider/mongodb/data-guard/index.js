/**
 * MongoDB Data Guard — provider filter for MongoDB MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'mongodb-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'MongoDB Data Guard',
    blockedTools: [
  'drop_database',
  'drop_collection',
  'delete_many',
  'drop_index',
],
    maskedFields: [
  'connection_string',
  'password',
  'uri',
],
    tokenReplacers: [
  { pattern: new RegExp("mongodb\\+srv://[^\\s\\\"']+", "g"), replacement: "mongodb+srv://[REDACTED]" },
  { pattern: new RegExp("mongodb://[^\\s\\\"']+", "g"), replacement: "mongodb://[REDACTED]" },
],
  }),
});
