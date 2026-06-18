/**
 * Asana Data Guard — provider filter for Asana MCP integrations.
 *
 * Pre-request: blocks workspace/project/task destructive operations.
 * Post-response: masks assignee emails, personal access tokens, and phone numbers.
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
  'delete_project',
  'delete_task',
  'delete_workspace',
  'remove_user',
  'delete_team',
  'delete_portfolio',
  'delete_webhook',
];

const DEFAULT_MASK_FIELDS = [
  'email',
  'assignee_email',
  'created_by_email',
  'phone',
  'mobile',
  'personal_access_token',
  'token',
];

const TOKEN_REPLACERS = [
  { pattern: /\b0\/[0-9a-f]{32,}\b/gi, replacement: '0/[REDACTED]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@asana\.com\b/gi, replacement: '[REDACTED]@asana.com' },
];

function scrubPayload(raw) {
  const parsed = tryParseJSON(raw);
  const { value: tokenScrubbed, count: tokenCount } = deepReplaceStrings(parsed, TOKEN_REPLACERS);
  const { value, count: fieldCount } = deepMaskKeys(tokenScrubbed, DEFAULT_MASK_FIELDS, '[REDACTED]');
  return { value, count: tokenCount + fieldCount };
}

function evaluate(args, config, metadata) {
  const toolName = normalizeToolName(metadata, args);
  const blockedTools = config.blocked_tools || DEFAULT_BLOCKED_TOOLS;
  const block = blockIfToolMatches(toolName, blockedTools, 'Asana Data Guard');
  if (block) return block;

  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: 'No Asana response payload to scrub' };
  }

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      const { value, count } = scrubPayload(parsed === frame ? frame : parsed);
      if (!count) return frame;
      return typeof parsed === 'string' && parsed === frame ? value : JSON.stringify(value);
    });
    if (rows.join('\n') === payload.rows.join('\n')) {
      return { action: 'allow', reason: 'No Asana PII detected' };
    }
    return {
      action: 'modify',
      reason: 'Masked Asana PII and tokens',
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const { value, count } = scrubPayload(payload.raw);
  if (!count) return { action: 'allow', reason: 'No Asana PII detected' };
  return {
    action: 'modify',
    reason: `Masked ${count} Asana sensitive field${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

createFilterServer({ slug: 'asana-data-guard', version: '1.0.0', evaluate });
