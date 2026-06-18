/**
 * Tableau Data Guard — provider filter for Tableau MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'tableau-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Tableau Data Guard',
    blockedTools: [
  'delete_workbook',
  'delete_datasource',
  'delete_project',
  'delete_user',
],
    maskedFields: [
  'personal_access_token',
  'password',
  'secret',
  'email',
],
    tokenReplacers: [],
  }),
});
