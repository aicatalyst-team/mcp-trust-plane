/**
 * PayPal Data Guard — provider filter for PayPal MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'paypal-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'PayPal Data Guard',
    blockedTools: [
  'create_refund',
  'capture_refund',
  'delete_webhook',
  'cancel_subscription',
],
    maskedFields: [
  'client_secret',
  'access_token',
  'payer_email',
  'email',
],
    tokenReplacers: [],
  }),
});
