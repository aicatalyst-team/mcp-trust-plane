/**
 * Confluence Data Guard — provider filter for Confluence MCP integrations.
 *
 * Pre-request: blocks space/page destructive operations and bulk export tools.
 * Post-response: masks author emails and truncates oversized page bodies.
 */
const { createFilterServer } = require('../../_lib/server');
const { blockIfToolMatches, normalizeToolName } = require('../../_lib/pre-request');
const {
  buildModifiedResponse,
  deepMaskKeys,
  payloadFromArguments,
  tryParseJSON,
} = require('../../_lib/json-utils');

const DEFAULT_BLOCKED_TOOLS = [
  'delete_space',
  'delete_page',
  'delete_content',
  'remove_permission',
  'delete_attachment',
  'purge_trash',
  'export_space',
];

const DEFAULT_MASK_FIELDS = [
  'email',
  'author_email',
  'creator_email',
  'owner_email',
  'accountId',
  'token',
];

function truncateBody(value, maxChars) {
  if (typeof value !== 'string' || value.length <= maxChars) return { value, truncated: false };
  return {
    value: `${value.slice(0, maxChars)}… [truncated by Confluence Data Guard]`,
    truncated: true,
  };
}

function scrubTree(node, config, stats) {
  if (Array.isArray(node)) return node.map((item) => scrubTree(item, config, stats));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(node)) {
      const lower = key.toLowerCase();
      if (['body', 'storage', 'content', 'value', 'plain_text'].includes(lower) && typeof val === 'string') {
        const maxChars = config.max_body_chars || 12000;
        const { value, truncated } = truncateBody(val, maxChars);
        out[key] = value;
        if (truncated) stats.truncated += 1;
        continue;
      }
      out[key] = scrubTree(val, config, stats);
    }
    return out;
  }
  return node;
}

function scrubPayload(raw, config) {
  const parsed = tryParseJSON(raw);
  const maskFields = config.masked_fields || DEFAULT_MASK_FIELDS;
  const stats = { truncated: 0 };
  const treeScrubbed = scrubTree(parsed, config, stats);
  const { value, count: fieldCount } = deepMaskKeys(
    treeScrubbed,
    maskFields,
    config.mask_value || '[REDACTED]',
  );
  return { value, count: fieldCount + stats.truncated };
}

function evaluate(args, config, metadata) {
  const toolName = normalizeToolName(metadata, args);
  const blockedTools = config.blocked_tools || DEFAULT_BLOCKED_TOOLS;
  const block = blockIfToolMatches(toolName, blockedTools, 'Confluence Data Guard');
  if (block) return block;

  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: 'No Confluence response payload to scrub' };
  }

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      const { value, count } = scrubPayload(parsed === frame ? frame : parsed, config);
      if (!count) return frame;
      return typeof parsed === 'string' && parsed === frame ? value : JSON.stringify(value);
    });
    if (rows.join('\n') === payload.rows.join('\n')) {
      return { action: 'allow', reason: 'No Confluence sensitive data detected' };
    }
    return {
      action: 'modify',
      reason: 'Masked Confluence authors and truncated oversized content',
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const { value, count } = scrubPayload(payload.raw, config);
  if (!count) return { action: 'allow', reason: 'No Confluence sensitive data detected' };
  return {
    action: 'modify',
    reason: `Applied ${count} Confluence data guard change${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

createFilterServer({ slug: 'confluence-data-guard', version: '1.0.0', evaluate });
