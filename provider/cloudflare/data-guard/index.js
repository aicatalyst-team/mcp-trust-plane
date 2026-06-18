/**
 * Cloudflare Data Guard — provider filter for Cloudflare MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'cloudflare-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Cloudflare Data Guard',
    blockedTools: [
  'delete_zone',
  'purge_cache',
  'delete_dns_record',
  'delete_worker',
],
    maskedFields: [
  'api_token',
  'api_key',
  'origin_ca_key',
],
    tokenReplacers: [
  { pattern: new RegExp("\\b[A-Za-z0-9_-]{40}\\b", "g"), replacement: "[CF_TOKEN_REDACTED]" },
],
  }),
});
