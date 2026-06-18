/**
 * Shared pre-request helpers for provider filters.
 */

function normalizeToolName(metadata = {}, args = {}) {
  return String(
    metadata.tool_name
    || args.tool
    || args.tool_name
    || args.name
    || '',
  ).toLowerCase();
}

function matchesBlockedTool(toolName, blockedTools = []) {
  return blockedTools.some((pattern) => {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const re = new RegExp(pattern.slice(1, -1), 'i');
      return re.test(toolName);
    }
    return toolName.includes(String(pattern).toLowerCase());
  });
}

function blockIfToolMatches(toolName, blockedTools, reasonPrefix) {
  if (!blockedTools.length) return null;
  if (!matchesBlockedTool(toolName, blockedTools)) return null;
  return {
    action: 'block',
    reason: `${reasonPrefix}: blocked tool "${toolName}"`,
  };
}

module.exports = {
  normalizeToolName,
  matchesBlockedTool,
  blockIfToolMatches,
};
