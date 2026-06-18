/**
 * Atlassian Data Guard — provider filter for Jira / Atlassian MCP integrations.
 *
 * Pre-request: blocks issue/project/permission destructive operations.
 * Post-response: masks reporter/assignee emails, API tokens, and account IDs when configured.
 */
const { createFilterServer } = require('../../_lib/server');
const { blockIfToolMatches, normalizeToolName } = require('../../_lib/pre-request');
const {
  buildModifiedResponse,
  deepMaskKeys,
  deepReplaceStrings,
  payloadFromArguments,
  tryParseJSON,
} = require('../../_lib/json-utils');

const DEFAULT_BLOCKED_TOOLS = [
  'delete_issue',
  'delete_project',
  'delete_board',
  'delete_sprint',
  'remove_permission',
  'delete_user',
  'delete_webhook',
  'delete_filter',
  'delete_component',
];

const DEFAULT_MASK_FIELDS = [
  'emailAddress',
  'email',
  'reporter_email',
  'assignee_email',
  'author_email',
  'accountId',
  'api_token',
  'token',
];

const TOKEN_REPLACERS = [
  {
    pattern: /("?(?:api_token|authorization|x-api-token)"?\s*[:=]\s*"?)([^",\s}]+)/gi,
    replacement: '$1[REDACTED]',
  },
];

function scrubPayload(raw, config) {
  const parsed = tryParseJSON(raw);
  const maskFields = config.masked_fields || DEFAULT_MASK_FIELDS;
  const { value: tokenScrubbed, count: tokenCount } = deepReplaceStrings(parsed, TOKEN_REPLACERS);
  const { value, count: fieldCount } = deepMaskKeys(
    tokenScrubbed,
    maskFields,
    config.mask_value || '[REDACTED]',
  );
  return { value, count: tokenCount + fieldCount };
}

function evaluate(args, config, metadata) {
  const toolName = normalizeToolName(metadata, args);
  const blockedTools = config.blocked_tools || DEFAULT_BLOCKED_TOOLS;
  const block = blockIfToolMatches(toolName, blockedTools, 'Atlassian Data Guard');
  if (block) return block;

  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: 'No Atlassian response payload to scrub' };
  }

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      const { value, count } = scrubPayload(parsed === frame ? frame : parsed, config);
      if (!count) return frame;
      return typeof parsed === 'string' && parsed === frame ? value : JSON.stringify(value);
    });
    if (rows.join('\n') === payload.rows.join('\n')) {
      return { action: 'allow', reason: 'No Atlassian sensitive data detected' };
    }
    return {
      action: 'modify',
      reason: 'Masked Atlassian user identifiers and tokens',
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const { value, count } = scrubPayload(payload.raw, config);
  if (!count) return { action: 'allow', reason: 'No Atlassian sensitive data detected' };
  return {
    action: 'modify',
    reason: `Masked ${count} Atlassian sensitive field${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

createFilterServer({ slug: 'atlassian-data-guard', version: '1.0.0', evaluate });
