# Architecture

```
                                ┌─────────────────────┐
                                │   Filter Engine     │
                                │  (queries policy DB │
                                │   and dispatches    │
                                │   to filters)       │
                                └──────────┬──────────┘
                                           │
                              ┌────────────┴────────────┬────────────────┐
   Client ─▶ Gateway ─────────┤                         │                │
                              ▼                         ▼                ▼
                       ┌────────────┐           ┌────────────┐    ┌────────────┐
                       │ sql-guard  │           │ row-limiter│    │ rate-limit │
                       │  :6001     │           │  :6003     │    │  :6007     │
                       └────────────┘           └────────────┘    └────────────┘
                              │
                              ▼ (allow)
                       Upstream MCP server
```

## Pieces

- **Gateway** (`secure-ai-plane/mcp-filter-gateway`) — sits in front of
  the upstream MCP server, intercepts `tools/call`, calls the engine
  twice per request (pre-request and post-response), applies the
  decision.
- **Engine** (`project-hub/server/src/routes/filter-execute.routes.js`)
  — looks up policies for the target, walks the filter chain in
  priority order, returns the final decision. Stateless beyond the
  policy database.
- **Policy DB** — three tables:
  - `ablv_mcp_filters`        (registry: name, slug, filter_url, execution_point, default_config, is_premium)
  - `ablv_mcp_policies`       (named bundles of filters)
  - `ablv_mcp_policy_filters` (filter ↔ policy with priority and override_config)
  - `ablv_mcp_policy_assignments` (policy ↔ target: global / mcp_server / agent / project)
- **Filters** (this repo) — independent HTTP services. One process per
  filter. Each filter knows nothing about the others, the gateway, or
  the policy DB. They are pure functions of `(config, arguments,
  metadata)`.

## Why HTTP and not in-process plugins

- **Language independence.** Write filters in Go, Python, Rust — the
  team picks. JSON over HTTP is the lingua franca.
- **Independent deployment.** A misbehaving filter can be hot-restarted
  without restarting the gateway. Filters can be scaled horizontally
  per their actual load (a regex-based PII redactor scales differently
  from a rate limiter with shared state).
- **Security boundary.** A buggy or compromised filter can crash its
  own process and bring down only itself. The gateway fails open and
  surfaces the failure in audit.
- **Pluggability.** Adding a filter is "drop a row in the DB". Removing
  one is "delete the row". No code change in the gateway or engine.

## Why a separate engine

The engine could live inside the gateway, but separating it keeps the
gateway tiny (just JSON-RPC parsing + filter dispatch) and lets the
engine evolve independently. The engine encodes policy semantics —
priority, target matching, fail-open rules — which is the part that
gets the most refinement over time.

## Common vs Provider

Both kinds of filter speak the same protocol and are dispatched by the
same engine. **Common** filters (`common/`) are cross-cutting guards that
apply to any MCP server — SQL safety, PII redaction, rate limits, etc.
**Provider** filters (`provider/<vendor>/`) encode vendor-specific tool
names and response shapes (AWS credentials, GitHub PATs, Jira account IDs,
Confluence page exports, and so on). Assign provider filters to MCP
targets that front that integration.
