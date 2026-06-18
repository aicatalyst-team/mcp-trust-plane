/**
 * Square Data Guard — provider filter for Square MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'square-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Square Data Guard',
    blockedTools: [
  'delete_customer',
  'delete_payment',
  'refund_payment',
  'delete_catalog',
],
    maskedFields: [
  'access_token',
  'application_secret',
  'email',
  'phone_number',
],
    tokenReplacers: [],
  }),
});
