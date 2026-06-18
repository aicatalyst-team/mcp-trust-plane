/**
 * GitLab Data Guard — provider filter for GitLab MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'gitlab-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'GitLab Data Guard',
    blockedTools: [
  'delete_project',
  'delete_branch',
  'delete_repository',
  'remove_member',
],
    maskedFields: [
  'email',
  'private_token',
  'access_token',
],
    tokenReplacers: [
  { pattern: new RegExp("\\bglpat-[A-Za-z0-9_-]{20,}\\b", "g"), replacement: "glpat-[REDACTED]" },
],
  }),
});
