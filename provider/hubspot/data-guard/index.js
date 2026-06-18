/**
 * HubSpot Data Guard — provider filter for HubSpot MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'hubspot-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'HubSpot Data Guard',
    blockedTools: [
  'delete_contact',
  'delete_company',
  'delete_deal',
  'delete_ticket',
],
    maskedFields: [
  'access_token',
  'refresh_token',
  'email',
  'hs_email',
],
    tokenReplacers: [],
  }),
});
