/**
 * GitHub Data Guard — provider filter for GitHub MCP integrations.
 *
 * Pre-request: blocks repo/org destructive operations and secret exfiltration tools.
 * Post-response: masks PATs, OAuth tokens, and user email fields.
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
  'delete_repository',
  'delete_repo',
  'delete_branch',
  'force_push',
  'add_collaborator',
  'remove_collaborator',
  'delete_org',
  'delete_team',
  'create_repo_hook',
  'update_repo_permissions',
];

const TOKEN_REPLACERS = [
  { pattern: /\bghp_[A-Za-z0-9]{20,}\b/g, replacement: 'ghp_[REDACTED]' },
  { pattern: /\bgho_[A-Za-z0-9]{20,}\b/g, replacement: 'gho_[REDACTED]' },
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, replacement: 'github_pat_[REDACTED]' },
  { pattern: /\bghu_[A-Za-z0-9]{20,}\b/g, replacement: 'ghu_[REDACTED]' },
];

const DEFAULT_MASK_FIELDS = [
  'email',
  'author_email',
  'committer_email',
  'token',
  'access_token',
  'authorization',
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
  const block = blockIfToolMatches(toolName, blockedTools, 'GitHub Data Guard');
  if (block) return block;

  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: 'No GitHub response payload to scrub' };
  }

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      const { value, count } = scrubPayload(parsed === frame ? frame : parsed);
      if (!count) return frame;
      return typeof parsed === 'string' && parsed === frame ? value : JSON.stringify(value);
    });
    if (rows.join('\n') === payload.rows.join('\n')) {
      return { action: 'allow', reason: 'No GitHub secrets detected' };
    }
    return {
      action: 'modify',
      reason: 'Masked GitHub tokens and email fields',
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const { value, count } = scrubPayload(payload.raw);
  if (!count) return { action: 'allow', reason: 'No GitHub secrets detected' };
  return {
    action: 'modify',
    reason: `Masked ${count} GitHub sensitive field${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

createFilterServer({ slug: 'github-data-guard', version: '1.0.0', evaluate });
