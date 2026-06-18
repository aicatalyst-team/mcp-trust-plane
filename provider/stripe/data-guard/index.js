/**
 * Stripe Data Guard — provider filter for Stripe MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'stripe-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Stripe Data Guard',
    blockedTools: [
  'delete_customer',
  'create_refund',
  'cancel_subscription',
  'delete_product',
],
    maskedFields: [
  'secret_key',
  'api_key',
  'email',
  'card_number',
],
    tokenReplacers: [
  { pattern: new RegExp("\\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}\\b", "g"), replacement: "sk_[REDACTED]" },
],
  }),
});
