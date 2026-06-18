/**
 * Factory for provider-specific data-guard filters.
 * Keeps individual provider index.js files small and consistent.
 */
const { blockIfToolMatches, normalizeToolName } = require('./pre-request');
const {
  buildModifiedResponse,
  deepMaskKeys,
  deepReplaceStrings,
  payloadFromArguments,
  tryParseJSON,
} = require('./json-utils');

const GENERIC_MASK_FIELDS = [
  'token',
  'api_key',
  'apiKey',
  'api_token',
  'access_token',
  'refresh_token',
  'secret',
  'password',
  'client_secret',
  'authorization',
  'email',
];

function compileReplacers(replacers = []) {
  return replacers.map((item) => ({
    pattern: item.pattern instanceof RegExp ? item.pattern : new RegExp(item.pattern, item.flags || 'g'),
    replacement: item.replacement,
  }));
}

function truncateBody(value, maxChars) {
  if (typeof value !== 'string' || value.length <= maxChars) {
    return { value, truncated: false };
  }
  return {
    value: `${value.slice(0, maxChars)}… [truncated]`,
    truncated: true,
  };
}

function scrubTree(node, config, stats) {
  const fields = config.truncate_body_fields || [];
  if (!fields.length) return node;

  if (Array.isArray(node)) return node.map((item) => scrubTree(item, config, stats));
  if (node && typeof node === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(node)) {
      const lower = key.toLowerCase();
      if (fields.includes(lower) && typeof val === 'string') {
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

function scrubPayload(raw, defaults, config) {
  const parsed = tryParseJSON(raw);
  const maskFields = config.masked_fields || defaults.maskedFields || GENERIC_MASK_FIELDS;
  const maskValue = config.mask_value || defaults.maskValue || '[REDACTED]';
  const replacers = compileReplacers(config.token_patterns || defaults.tokenReplacers || []);
  const stats = { truncated: 0 };

  const treeScrubbed = scrubTree(parsed, {
    truncate_body_fields: (config.truncate_body_fields || defaults.truncateBodyFields || [])
      .map((f) => f.toLowerCase()),
    max_body_chars: config.max_body_chars || defaults.maxBodyChars || 12000,
  }, stats);

  const { value: tokenScrubbed, count: tokenCount } = deepReplaceStrings(treeScrubbed, replacers);
  const { value, count: fieldCount } = deepMaskKeys(tokenScrubbed, maskFields, maskValue);
  return { value, count: tokenCount + fieldCount + stats.truncated };
}

function processPayload(args, config, defaults, guardName) {
  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: `No ${guardName} response payload to scrub` };
  }

  const allowReason = defaults.allowReason || 'No sensitive data detected';

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      const { value, count } = scrubPayload(parsed === frame ? frame : parsed, defaults, config);
      if (!count) return frame;
      return typeof parsed === 'string' && parsed === frame ? value : JSON.stringify(value);
    });
    if (rows.join('\n') === payload.rows.join('\n')) {
      return { action: 'allow', reason: allowReason };
    }
    return {
      action: 'modify',
      reason: `${guardName}: scrubbed sensitive response data`,
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const { value, count } = scrubPayload(payload.raw, defaults, config);
  if (!count) return { action: 'allow', reason: allowReason };
  return {
    action: 'modify',
    reason: `${guardName}: applied ${count} data guard change${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

function createDataGuardEvaluate(defaults) {
  const guardName = defaults.guardName || 'Provider Data Guard';
  const blockedTools = defaults.blockedTools || [];

  return function evaluate(args, config, metadata) {
    const toolName = normalizeToolName(metadata, args);
    const effectiveBlocked = config.blocked_tools || blockedTools;
    const block = blockIfToolMatches(toolName, effectiveBlocked, guardName);
    if (block) return block;

    if (defaults.preRequestOnly) {
      return { action: 'allow', reason: `${guardName}: request allowed` };
    }

    return processPayload(args, config, defaults, guardName);
  };
}

module.exports = {
  createDataGuardEvaluate,
  GENERIC_MASK_FIELDS,
  compileReplacers,
};
