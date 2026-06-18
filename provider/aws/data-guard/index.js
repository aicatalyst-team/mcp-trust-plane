/**
 * AWS Data Guard — provider filter for AWS MCP integrations.
 *
 * Pre-request: blocks destructive IAM / EC2 / S3 / RDS tool calls.
 * Post-response: scrubs access keys, session tokens, and PEM material.
 */
const { createFilterServer } = require('../../_lib/server');
const { blockIfToolMatches, normalizeToolName } = require('../../_lib/pre-request');
const {
  buildModifiedResponse,
  deepReplaceStrings,
  payloadFromArguments,
  tryParseJSON,
} = require('../../_lib/json-utils');

const DEFAULT_BLOCKED_TOOLS = [
  'delete_bucket',
  'delete_user',
  'delete_role',
  'delete_policy',
  'terminate_instances',
  'delete_db_instance',
  'delete_db_cluster',
  'detach_user_policy',
  'put_bucket_policy',
  'create_access_key',
];

const SECRET_REPLACERS = [
  { pattern: /\b(AKIA[0-9A-Z]{16})\b/g, replacement: 'AKIA****************' },
  { pattern: /\b(ASIA[0-9A-Z]{16})\b/g, replacement: 'ASIA****************' },
  {
    pattern: /("?(?:SecretAccessKey|secret_access_key|aws_secret_access_key)"?\s*[:=]\s*"?)([^",\s}]+)/gi,
    replacement: '$1***REDACTED***',
  },
  {
    pattern: /("?(?:SessionToken|session_token|aws_session_token)"?\s*[:=]\s*"?)([^",\s}]+)/gi,
    replacement: '$1***REDACTED***',
  },
  {
    pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC )?PRIVATE KEY-----/g,
    replacement: '-----BEGIN PRIVATE KEY-----[REDACTED]-----END PRIVATE KEY-----',
  },
];

function evaluate(args, config, metadata) {
  const toolName = normalizeToolName(metadata, args);
  const blockedTools = config.blocked_tools || DEFAULT_BLOCKED_TOOLS;
  const block = blockIfToolMatches(toolName, blockedTools, 'AWS Data Guard');
  if (block) return block;

  const payload = payloadFromArguments(args);
  if (payload.kind === 'none') {
    return { action: 'allow', reason: 'No AWS response payload to scrub' };
  }

  if (payload.kind === 'rows') {
    const rows = payload.rows.map((frame) => {
      const parsed = tryParseJSON(frame);
      if (parsed === frame) {
        const { value, count } = deepReplaceStrings(frame, SECRET_REPLACERS);
        return count ? value : frame;
      }
      const { value } = deepReplaceStrings(parsed, SECRET_REPLACERS);
      return JSON.stringify(value);
    });
    const joined = rows.join('\n');
    const changed = joined !== payload.rows.join('\n');
    if (!changed) return { action: 'allow', reason: 'No AWS secrets detected' };
    return {
      action: 'modify',
      reason: 'Scrubbed AWS credentials from response',
      modified_response: buildModifiedResponse(args, { kind: 'rows', rows }),
    };
  }

  const parsed = tryParseJSON(payload.raw);
  const { value, count } = deepReplaceStrings(parsed, SECRET_REPLACERS);
  if (!count) return { action: 'allow', reason: 'No AWS secrets detected' };
  return {
    action: 'modify',
    reason: `Scrubbed ${count} AWS secret pattern${count === 1 ? '' : 's'}`,
    modified_response: buildModifiedResponse(args, {
      kind: 'data',
      raw: typeof payload.raw === 'string' ? JSON.stringify(value) : value,
    }),
  };
}

createFilterServer({ slug: 'aws-data-guard', version: '1.0.0', evaluate });
