/**
 * Supabase Data Guard — provider filter for Supabase MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'supabase-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Supabase Data Guard',
    blockedTools: [
  'delete_project',
  'delete_branch',
  'drop_table',
  'delete_user',
],
    maskedFields: [
  'service_role_key',
  'anon_key',
  'connection_string',
  'password',
],
    tokenReplacers: [],
  }),
});
