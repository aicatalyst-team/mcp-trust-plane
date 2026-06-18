# Filter HTTP Contract

Every filter MUST conform to the following contract. The reference
engine in `secure-ai-plane-x/mcp-filter-gateway` calls filters using
this exact shape.

## Endpoints

| Method | Path     | Required | Purpose                            |
|--------|----------|----------|------------------------------------|
| POST   | /filter  | yes      | Make an allow/block/modify decision |
| GET    | /health  | yes      | Liveness check                     |

## POST /filter — Request

```jsonc
{
  // Filter-specific configuration. Comes from the policy that bound
  // this filter to a target. May be the filter's default_config or an
  // override_config from the policy_filter row.
  "config": { "max_per_minute": 30 },

  // Tool-call arguments and (for post-response phase) the upstream
  // response. Shape varies by execution_point:
  //
  //   pre-request:  { "<tool-arg>": "...", "<tool-arg>": "..." }
  //   post-response: { "response_count": N,
  //                    "response_rows":  ["...", "..."],
  //                    "response_data":  "<combined string>" }
  "arguments": { "...": "..." },

  // Identity + routing context propagated from the gateway. Filters
  // SHOULD treat metadata as untrusted strings.
  "metadata": {
    "agent_id":   "demo_agent",
    "agent_name": "demo_agent",
    "member_id":  "f5d9e4ec-f270-4048-b61b-29f967c45f38",
    "project_id": "b0000000-0000-0000-0000-000000000001",
    "tool_name":  "run_sql"
  }
}
```

## POST /filter — Response

```jsonc
{
  // Mandatory.
  "action": "allow",        // allow | block | truncate | modify
  "reason": "Rate OK 4/30", // surfaced to clients and audit log

  // Optional. Required when action is `truncate` or `modify`.
  // Shape is filter-specific; the engine forwards it verbatim through
  // `result._meta._abluva` so observability tooling can render it.
  "modified_response": {
    "truncated_to":  1000,
    "original_count": 8421,
    "content":       "<truncated payload>"
  },

  // Optional. Used by truncate filters to populate audit headers and
  // the `original_count` / `truncated_to` columns.
  "original_count": 8421,
  "truncated_to":   1000
}
```

## Action semantics

| action     | Effect on the gateway                                                                 |
|------------|---------------------------------------------------------------------------------------|
| allow      | Forward unchanged. Most filters return this on the happy path.                         |
| block      | Return a JSON-RPC error to the client. `reason` becomes the user-visible error.        |
| truncate   | Return `modified_response`. Append a truncation notice. Useful for row caps.           |
| modify     | Return `modified_response`. Useful for PII redaction, column masking, value rewriting. |

If a filter is unreachable, throws, or violates the contract, the engine
treats the call as `allow`. This is "fail-open" by design — the goal of
the framework is to catch bad MCP responses without blocking the legit
ones when infrastructure has a hiccup. Filters that need fail-closed
semantics (e.g. PII redaction in regulated environments) must be paired
with a separate health-gating layer.

## Execution points

A filter declares which execution point it runs at via the
`execution_point` column on `ablv_mcp_filters`:

- `pre-request` — runs before the upstream MCP call. Sees tool name and
  arguments, can `allow` or `block`. Examples: SQL Guard, Rate Limiter.
- `post-response` — runs after the upstream MCP call returns. Sees the
  full response, can `allow`, `truncate`, `modify`, or `block`. Examples:
  PII Redactor, Row Limiter, Field Masker.

A filter MUST NOT be registered at both phases; create two filters with
distinct slugs if you need pre + post behaviour from the same library.

## Idempotency and concurrency

The engine may call a filter many times concurrently for the same agent.
Filters MUST be safe to invoke in parallel. State (rate-limit windows,
audit counters) belongs in a shared store, not process-local memory, if
the filter is to be replicated.

## Performance

Filters are in the hot path for every tool call. Aim for <50ms p95.
Anything over the configured `timeout_ms` is treated as `allow` and
logged. Default timeout is 5s.

## Versioning

A filter MAY return additional fields in the response; the engine
ignores unknown fields. Breaking changes (renaming `action` values, for
example) require a new filter slug.
