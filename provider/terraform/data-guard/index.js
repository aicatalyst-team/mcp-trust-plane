/**
 * Terraform Data Guard — provider filter for Terraform MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'terraform-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Terraform Data Guard',
    blockedTools: [
  'destroy',
  'apply',
  'force_unlock',
  'delete_workspace',
],
    maskedFields: [
  'token',
  'api_token',
  'sensitive',
  'password',
],
    tokenReplacers: [
  { pattern: new RegExp("\\b[A-Za-z0-9]{14}\\.[A-Za-z0-9]{16}\\.[A-Za-z0-9]{16}\\b", "g"), replacement: "[TF_TOKEN_REDACTED]" },
],
  }),
});
