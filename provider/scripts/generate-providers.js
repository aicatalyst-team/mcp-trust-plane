#!/usr/bin/env node
/**
 * Generates provider data-guard scaffolds from manifest.json.
 * Run: node provider/scripts/generate-providers.mjs
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

const DOCKERFILE = (folder, port) => `FROM node:20-alpine
WORKDIR /app
COPY _lib /app/provider/_lib
COPY ${folder}/data-guard /app/provider/${folder}/data-guard
WORKDIR /app/provider/${folder}/data-guard
EXPOSE ${port}
ENV PORT=${port}
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:${port}/health || exit 1
CMD ["node", "index.js"]
`;

const PACKAGE_JSON = (slug) => JSON.stringify({
  name: `mcp-filter-${slug}`,
  version: '0.1.0',
  description: `Provider data guard for ${slug.replace(/-data-guard$/, '')} MCP integrations.`,
  main: 'index.js',
  scripts: { start: 'node index.js' },
  license: 'Apache-2.0',
}, null, 2) + '\n';

function jsStringArray(items) {
  if (!items.length) return '[]';
  return `[\n${items.map((i) => `  '${i.replace(/'/g, "\\'")}',`).join('\n')}\n]`;
}

function jsReplacers(replacers) {
  if (!replacers.length) return '[]';
  return `[\n${replacers.map((r) => {
    const flags = r.flags || 'g';
    return `  { pattern: new RegExp(${JSON.stringify(r.source)}, ${JSON.stringify(flags)}), replacement: ${JSON.stringify(r.replacement)} },`;
  }).join('\n')}\n]`;
}

function generateIndex(provider) {
  const slug = `${provider.id}-data-guard`;
  const title = provider.title || provider.id;
  const lines = [
    '/**',
    ` * ${title} Data Guard — provider filter for ${title} MCP integrations.`,
    ' *',
    ' * @see README.md for contributor notes and default guard rules.',
    ' */',
    "const { createFilterServer } = require('../../_lib/server');",
    "const { createDataGuardEvaluate } = require('../../_lib/data-guard');",
    '',
    'createFilterServer({',
    `  slug: '${slug}',`,
    "  version: '0.1.0',",
    '  evaluate: createDataGuardEvaluate({',
    `    guardName: '${title} Data Guard',`,
    `    blockedTools: ${jsStringArray(provider.blockedTools || [])},`,
    `    maskedFields: ${jsStringArray(provider.maskedFields || [])},`,
    `    tokenReplacers: ${jsReplacers(provider.tokenReplacers || [])},`,
  ];

  if (provider.truncateBodyFields?.length) {
    lines.push(`    truncateBodyFields: ${jsStringArray(provider.truncateBodyFields)},`);
    lines.push(`    maxBodyChars: ${provider.maxBodyChars || 12000},`);
  }

  if (provider.preRequestOnly) {
    lines.push('    preRequestOnly: true,');
  }

  lines.push('  }),');
  lines.push('});');
  lines.push('');
  return lines.join('\n');
}

function generateReadme(provider) {
  const title = provider.title || provider.id;
  return `# ${title} Data Guard

Provider filter for **${title}** MCP server integrations.

## Slug

\`${provider.id}-data-guard\`

## Default port

${provider.port}

## Guard rules

### Pre-request (blocked tools)

${(provider.blockedTools || []).length
    ? provider.blockedTools.map((t) => `- \`${t}\``).join('\n')
    : '- _(none yet — contributions welcome)_'}

### Post-response (masked fields)

${(provider.maskedFields || []).length
    ? provider.maskedFields.map((f) => `- \`${f}\``).join('\n')
    : '- Generic secrets: \`token\`, \`api_key\`, \`secret\`, \`password\`, \`email\`'}

## Contributing

Improve this filter by:

1. Adding tool names from real ${title} MCP servers to \`blockedTools\` in \`index.js\`.
2. Extending \`maskedFields\` / \`tokenReplacers\` for provider-specific secrets.
3. Adding behaviour tests under \`tests/provider/\` (future).

See \`../../README.md\` and \`../../../docs/ADDING_FILTERS.md\`.
`;
}

for (const provider of manifest.providers) {
  if (provider.skipGenerate) continue;
  const dir = path.join(ROOT, provider.id, 'data-guard');
  fs.mkdirSync(dir, { recursive: true });

  const indexPath = path.join(dir, 'index.js');
  if (!provider.preserveExisting || !fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, generateIndex(provider));
  }

  fs.writeFileSync(path.join(dir, 'package.json'), PACKAGE_JSON(`${provider.id}-data-guard`));
  fs.writeFileSync(path.join(dir, 'Dockerfile'), DOCKERFILE(provider.id, provider.port));
  fs.writeFileSync(path.join(dir, 'README.md'), generateReadme(provider));
}

function dockerService(provider) {
  const slug = `${provider.id}-data-guard`;
  return `  ${slug}:
    build:
      context: ./provider
      dockerfile: ${provider.id}/data-guard/Dockerfile
    image: mcp-filter-${slug}:latest
    container_name: mcp-filter-${slug}
    ports:
      - "${provider.port}:${provider.port}"
    environment:
      PORT: ${provider.port}
    restart: unless-stopped
`;
}

function updateDockerCompose() {
  const composePath = path.join(REPO, 'docker-compose.yml');
  let content = fs.readFileSync(composePath, 'utf8');
  const marker = '  # PROVIDER_FILTERS_GENERATED';
  const firstProvider = content.indexOf('  aws-data-guard:');
  if (firstProvider >= 0) {
    content = content.slice(0, firstProvider);
  }
  if (!content.trimEnd().endsWith(marker)) {
    content = content.trimEnd() + `\n\n${marker}\n`;
  } else {
    const idx = content.indexOf(marker);
    content = content.slice(0, idx + marker.length) + '\n';
  }
  for (const p of manifest.providers) {
    content += dockerService(p);
  }
  fs.writeFileSync(composePath, content.endsWith('\n') ? content : `${content}\n`);
}

function updateContractTest() {
  const testPath = path.join(REPO, 'tests', 'contract.js');
  let content = fs.readFileSync(testPath, 'utf8');
  const begin = 'const PROVIDER_FILTERS = [';
  const end = '];';
  const start = content.indexOf(begin);
  const endIdx = content.indexOf(end, start);
  const entries = manifest.providers.map((p) => (
    `  { slug: '${p.id}-data-guard', port: ${p.port}, dir: '../provider/${p.id}/data-guard' },`
  )).join('\n');
  content = content.slice(0, start + begin.length) + `\n${entries}\n` + content.slice(endIdx);
  fs.writeFileSync(testPath, content);
}

function updateDeployScript() {
  const deployPath = path.join(REPO, 'deploy.sh');
  let content = fs.readFileSync(deployPath, 'utf8');
  const begin = 'PROVIDER_FILTERS=(';
  const end = ')';
  const start = content.indexOf(begin);
  const endIdx = content.indexOf(end, start);
  const entries = manifest.providers.map((p) => (
    `  "${p.id}-data-guard:${p.port}:provider/${p.id}/data-guard/Dockerfile"`
  )).join('\n');
  content = content.slice(0, start + begin.length) + `\n${entries}\n` + content.slice(endIdx);
  fs.writeFileSync(deployPath, content);
}

function updateProviderReadme() {
  const readmePath = path.join(ROOT, 'README.md');
  const rows = manifest.providers.map((p) => (
    `| ${p.title || p.id} | \`${p.id}-data-guard\` | ${p.port} |`
  )).join('\n');
  const table = `| Provider | Slug | Port |\n|----------|------|------|\n${rows}\n`;
  let content = fs.readFileSync(readmePath, 'utf8');
  const begin = '<!-- PROVIDER_TABLE_START -->';
  const end = '<!-- PROVIDER_TABLE_END -->';
  const re = new RegExp(`${begin}[\\s\\S]*?${end}`);
  content = content.replace(re, `${begin}\n${table}${end}`);
  fs.writeFileSync(readmePath, content);
}

updateDockerCompose();
updateContractTest();
updateDeployScript();
updateProviderReadme();

console.log(`Generated ${manifest.providers.length} provider data-guard filters.`);
