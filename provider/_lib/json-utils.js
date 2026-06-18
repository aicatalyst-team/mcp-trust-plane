/**
 * JSON traversal helpers for post-response provider filters.
 */

function tryParseJSON(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return value;
  try { return JSON.parse(trimmed); } catch { return value; }
}

function deepWalk(value, visitor) {
  if (Array.isArray(value)) {
    return value.map((item) => deepWalk(item, visitor));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = deepWalk(visitor(key, val), visitor);
    }
    return out;
  }
  return visitor(null, value);
}

function deepMaskKeys(value, keys, maskValue, caseSensitive = false) {
  const lookup = new Set(
    keys.map((k) => (caseSensitive ? k : k.toLowerCase())),
  );
  const counter = { n: 0 };

  function walk(node) {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        const hit = lookup.has(caseSensitive ? k : k.toLowerCase());
        if (hit && v !== null && v !== undefined && v !== '') {
          out[k] = maskValue;
          counter.n += 1;
        } else {
          out[k] = walk(v);
        }
      }
      return out;
    }
    return node;
  }

  return { value: walk(node), count: counter.n };
}

function deepReplaceStrings(value, replacers) {
  const counter = { n: 0 };

  function walk(node) {
    if (typeof node === 'string') {
      let result = node;
      for (const { pattern, replacement } of replacers) {
        const next = result.replace(pattern, replacement);
        if (next !== result) counter.n += 1;
        result = next;
      }
      return result;
    }
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(node)) {
        out[k] = walk(v);
      }
      return out;
    }
    return node;
  }

  return { value: walk(value), count: counter.n };
}

function payloadFromArguments(args) {
  if (Array.isArray(args.response_rows)) {
    return { kind: 'rows', rows: args.response_rows };
  }
  const raw = args.response_data ?? args.result ?? args.response;
  if (raw === undefined || raw === null) return { kind: 'none' };
  return { kind: 'data', raw };
}

function buildModifiedResponse(args, modifiedPayload) {
  if (modifiedPayload.kind === 'rows') {
    return {
      rows: modifiedPayload.rows,
      original_count: modifiedPayload.rows.length,
      content: modifiedPayload.rows.join('\n'),
    };
  }
  if (modifiedPayload.kind === 'data') {
    const content = typeof modifiedPayload.raw === 'string'
      ? modifiedPayload.raw
      : JSON.stringify(modifiedPayload.raw);
    return { content };
  }
  return {};
}

module.exports = {
  tryParseJSON,
  deepWalk,
  deepMaskKeys,
  deepReplaceStrings,
  payloadFromArguments,
  buildModifiedResponse,
};
