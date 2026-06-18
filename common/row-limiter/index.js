/**
 * Row Limiter Filter (Post-Response)
 *
 * Caps the number of rows returned in MCP query results to prevent data
 * exfiltration. Works with several response shapes:
 *
 *   1. arguments.response_count + arguments.response_rows
 *      Preferred shape supplied by the MCP filter gateway. response_rows is
 *      an array of individual content frames; one frame per row in the
 *      mcp-toolbox / DB MCP convention.
 *
 *   2. arguments.response_data
 *      Single string (combined frames separated by newlines) or a JSON
 *      array/object with rows/data/results/items/records keys.
 *
 * Contract:
 *   POST /filter { config, arguments, metadata }
 *   -> { action: 'allow'|'truncate', reason, modified_response?, truncated_to? }
 */
const http = require('http');

const PORT = process.env.PORT || 6003;
const ROW_KEYS = ['rows', 'data', 'results', 'items', 'records'];

function tryParseJSON(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (trimmed[0] !== '{' && trimmed[0] !== '[') return value;
  try { return JSON.parse(trimmed); } catch { return value; }
}

function findArray(payload) {
  if (Array.isArray(payload)) return { array: payload, container: null, key: null };
  if (payload && typeof payload === 'object') {
    for (const key of ROW_KEYS) {
      if (Array.isArray(payload[key])) {
        return { array: payload[key], container: payload, key };
      }
    }
  }
  return null;
}

function applyRowLimit(args, maxRows, truncationMessage) {
  const rows = args.response_rows;
  if (Array.isArray(rows)) {
    if (rows.length <= maxRows) {
      return { truncated: false, rowCount: rows.length };
    }
    const keptRows = rows.slice(0, maxRows);
    return {
      truncated: true,
      rowCount: rows.length,
      truncatedTo: maxRows,
      keptRows,
      modified: keptRows.join('\n')
        + `\n\n--- ${truncationMessage} (${rows.length} total) ---`,
    };
  }

  const responseData = args.response_data ?? args.result ?? args;
  const parsed = tryParseJSON(responseData);
  const found = findArray(parsed);

  if (found) {
    const { array, container, key } = found;
    if (array.length <= maxRows) {
      return { truncated: false, rowCount: array.length };
    }
    let modified;
    if (container === null) {
      modified = array.slice(0, maxRows);
    } else {
      modified = {
        ...container,
        [key]: array.slice(0, maxRows),
        _truncated: true,
        _original_count: array.length,
        _max_rows: maxRows,
      };
    }
    if (typeof responseData === 'string') {
      modified = JSON.stringify(modified, null, 2);
    }
    return { truncated: true, rowCount: array.length, truncatedTo: maxRows, modified };
  }

  if (typeof parsed === 'string') {
    const lines = parsed.split('\n').filter(l => l.trim());
    if (lines.length <= maxRows) {
      return { truncated: false, rowCount: lines.length };
    }
    return {
      truncated: true,
      rowCount: lines.length,
      truncatedTo: maxRows,
      modified: lines.slice(0, maxRows).join('\n')
        + `\n\n--- ${truncationMessage} (${lines.length} total) ---`,
    };
  }

  return { truncated: false, rowCount: 0 };
}

function handleFilter(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const config = payload.config || {};
      const args = payload.arguments || {};

      const maxRows = Number(config.max_rows) > 0 ? Number(config.max_rows) : 1000;
      const truncationMessage = config.truncation_message || `Results truncated to ${maxRows} rows`;

      const { truncated, rowCount, modified, truncatedTo, keptRows } = applyRowLimit(args, maxRows, truncationMessage);

      if (truncated) {
        return respond(res, {
          action: 'truncate',
          reason: `${truncationMessage}: ${rowCount} rows truncated to ${truncatedTo}`,
          original_count: rowCount,
          truncated_to: truncatedTo,
          modified_response: {
            truncated_to: truncatedTo,
            original_count: rowCount,
            // Carry the kept rows as a structured array so chained
            // filters keep operating on per-row frames.
            rows: keptRows,
            content: modified,
          },
        });
      }

      respond(res, {
        action: 'allow',
        reason: `Row count OK: ${rowCount} rows (limit: ${maxRows})`,
      });
    } catch (err) {
      respond(res, { action: 'allow', reason: `Filter error: ${err.message}` });
    }
  });
}

function respond(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/filter') {
    return handleFilter(req, res);
  }
  if (req.url === '/health') {
    return respond(res, { status: 'healthy', filter: 'row-limiter', version: '1.2.0' });
  }
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Row Limiter filter running on port ${PORT}`);
});
