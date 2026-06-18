/**
 * Linear Data Guard — provider filter for Linear MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'linear-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Linear Data Guard',
    blockedTools: [
  'delete_issue',
  'delete_project',
  'delete_team',
  'archive_issue',
],
    maskedFields: [
  'api_key',
  'email',
  'assignee_email',
],
    tokenReplacers: [],
  }),
});
