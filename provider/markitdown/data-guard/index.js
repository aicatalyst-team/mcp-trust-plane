/**
 * MarkItDown Data Guard — provider filter for MarkItDown MCP integrations.
 *
 * @see README.md for contributor notes and default guard rules.
 */
const { createFilterServer } = require('../../_lib/server');
const { createDataGuardEvaluate } = require('../../_lib/data-guard');

createFilterServer({
  slug: 'markitdown-data-guard',
  version: '0.1.0',
  evaluate: createDataGuardEvaluate({
    guardName: 'MarkItDown Data Guard',
    blockedTools: [],
    maskedFields: [
  'path',
  'file_path',
  'local_path',
],
    tokenReplacers: [],
    truncateBodyFields: [
  'content',
  'markdown',
  'body',
],
    maxBodyChars: 8000,
  }),
});
