/**
 * PII Redactor Filter
 * Detects and masks personally identifiable information in MCP responses.
 * 
 * Standalone HTTP filter service — language independent, deployable anywhere.
 */
const http = require('http');

const PORT = process.env.PORT || 6002;

const PII_PATTERNS = {
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ip_address: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
};

function maskValue(value, maskChar = '*') {
  if (typeof value !== 'string') return value;
  return value.substring(0, 2) + maskChar.repeat(Math.max(value.length - 4, 3)) + value.substring(value.length - 2);
}

function redactPII(text, patterns, action, maskChar) {
  if (typeof text !== 'string') return { text, found: [] };
  let result = text;
  const found = [];

  for (const patternName of patterns) {
    const regex = PII_PATTERNS[patternName];
    if (!regex) continue;
    const matches = text.match(regex);
    if (matches) {
      found.push({ type: patternName, count: matches.length });
      if (action === 'mask') {
        result = result.replace(regex, match => maskValue(match, maskChar));
      } else if (action === 'remove') {
        result = result.replace(regex, '[REDACTED]');
      }
    }
  }

  return { text: result, found };
}

function deepRedact(obj, patterns, action, maskChar) {
  if (typeof obj === 'string') return redactPII(obj, patterns, action, maskChar).text;
  if (Array.isArray(obj)) return obj.map(item => deepRedact(item, patterns, action, maskChar));
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = deepRedact(val, patterns, action, maskChar);
    }
    return result;
  }
  return obj;
}

function handleFilter(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(body);
      const config = payload.config || {};
      const response = payload.response || {};
      const patterns = config.patterns || ['ssn', 'email', 'phone', 'credit_card'];
      const action = config.action || 'mask';
      const maskChar = config.mask_char || '*';

      // Check if response contains PII
      const responseStr = JSON.stringify(response);
      const { found } = redactPII(responseStr, patterns, 'mask', maskChar);

      if (found.length === 0) {
        return respond(res, { action: 'allow', reason: 'No PII detected' });
      }

      if (action === 'block') {
        return respond(res, {
          action: 'block',
          reason: `PII detected: ${found.map(f => `${f.count} ${f.type}`).join(', ')}`,
          metadata: { pii_found: found }
        });
      }

      // Mask or remove PII
      const modified = deepRedact(response, patterns, action, maskChar);
      respond(res, {
        action: 'modify',
        modified_data: modified,
        reason: `PII ${action}ed: ${found.map(f => `${f.count} ${f.type}`).join(', ')}`,
        metadata: { pii_found: found }
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
    handleFilter(req, res);
  } else if (req.url === '/health') {
    respond(res, { status: 'healthy', filter: 'pii-redactor', version: '1.0.0' });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`PII Redactor filter running on port ${PORT}`);
});
