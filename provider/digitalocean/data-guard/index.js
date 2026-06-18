/**
 * DigitalOcean Data Guard — provider filter for DigitalOcean MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'digitalocean-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'DigitalOcean Data Guard',
    blockedTools: [
  'delete_droplet',
  'delete_database',
  'delete_domain',
  'delete_firewall',
],
    maskedFields: [
  'token',
  'access_token',
  'secret',
],
    tokenReplacers: [],
  }),
});
