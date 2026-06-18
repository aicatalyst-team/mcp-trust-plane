/**
 * Playwright Data Guard — provider filter for Playwright MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'playwright-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'Playwright Data Guard',
    blockedTools: [
  'evaluate',
  'execute_script',
  'run_code',
  'shell',
  'download_file',
],
    maskedFields: [
  'cookie',
  'authorization',
  'local_storage',
  'session_storage',
],
    tokenReplacers: [],
    truncateBodyFields: [
  'html',
  'content',
  'screenshot',
],
    maxBodyChars: 16000,
  }),
});
