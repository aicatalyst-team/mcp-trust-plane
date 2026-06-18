# Provider filters

Provider-specific MCP filters live here. Each integration vendor gets its
own subdirectory; today each ships a `data-guard` filter tuned to that
provider's tool names and response shapes.

These filters complement the cross-cutting guards under `../common/`.
Assign a provider filter to MCP targets that front that vendor's server
(e.g. attach `github-data-guard` to a GitHub MCP deployment).

## Layout

```
provider/
├── manifest.json         # source of truth — ports, blocked tools, mask rules
├── scripts/
│   └── generate-providers.js
├── _lib/                 # shared HTTP server + data-guard factory
├── aws/data-guard/
├── github/data-guard/
├── stripe/data-guard/
└── …                     # 54 vendors — see manifest.json
```

## Filters

<!-- PROVIDER_TABLE_START -->
| Provider | Slug | Port |
|----------|------|------|
| AWS | `aws-data-guard` | 6301 |
| Asana | `asana-data-guard` | 6302 |
| Atlassian | `atlassian-data-guard` | 6303 |
| Confluence | `confluence-data-guard` | 6304 |
| GitHub | `github-data-guard` | 6305 |
| Azure | `azure-data-guard` | 6306 |
| BigQuery | `bigquery-data-guard` | 6307 |
| Brave Search | `brave-search-data-guard` | 6308 |
| Browserbase | `browserbase-data-guard` | 6309 |
| Google Calendar | `calendar-data-guard` | 6310 |
| Cloudflare | `cloudflare-data-guard` | 6311 |
| Databricks | `databricks-data-guard` | 6312 |
| Datadog | `datadog-data-guard` | 6313 |
| DeepWiki | `deepwiki-data-guard` | 6314 |
| DigitalOcean | `digitalocean-data-guard` | 6315 |
| DuckDuckGo | `duckduckgo-data-guard` | 6316 |
| Dynatrace | `dynatrace-data-guard` | 6317 |
| Elasticsearch | `elasticsearch-data-guard` | 6318 |
| Exa Search | `exa-search-data-guard` | 6319 |
| Files.com | `filescom-data-guard` | 6320 |
| Firecrawl | `firecrawl-data-guard` | 6321 |
| GitLab | `gitlab-data-guard` | 6322 |
| Gmail | `gmail-data-guard` | 6323 |
| Google | `google-data-guard` | 6324 |
| Grafana | `grafana-data-guard` | 6325 |
| HubSpot | `hubspot-data-guard` | 6326 |
| Linear | `linear-data-guard` | 6327 |
| MarkItDown | `markitdown-data-guard` | 6328 |
| Microsoft | `microsoft-data-guard` | 6329 |
| Monday.com | `mondaycom-data-guard` | 6330 |
| MongoDB | `mongodb-data-guard` | 6331 |
| Morningstar | `morningstar-data-guard` | 6332 |
| MySQL | `mysql-data-guard` | 6333 |
| Neon | `neon-data-guard` | 6334 |
| Notion | `notion-data-guard` | 6335 |
| OneDrive | `onedrive-data-guard` | 6336 |
| Outlook | `outlook-data-guard` | 6337 |
| PagerDuty | `pagerduty-data-guard` | 6338 |
| PayPal | `paypal-data-guard` | 6339 |
| Playwright | `playwright-data-guard` | 6340 |
| PostgreSQL | `postgresql-data-guard` | 6341 |
| Postman | `postman-data-guard` | 6342 |
| Redis | `redis-data-guard` | 6343 |
| Salesforce | `salesforce-data-guard` | 6344 |
| Slack | `slack-data-guard` | 6345 |
| Snowflake | `snowflake-data-guard` | 6346 |
| Square | `square-data-guard` | 6347 |
| Stripe | `stripe-data-guard` | 6348 |
| Supabase | `supabase-data-guard` | 6349 |
| Tableau | `tableau-data-guard` | 6350 |
| Tavily Search | `tavily-search-data-guard` | 6351 |
| Terraform | `terraform-data-guard` | 6352 |
| WordPress | `wordpress-data-guard` | 6353 |
| Zapier | `zapier-data-guard` | 6354 |
<!-- PROVIDER_TABLE_END -->

## Configuration

Each filter accepts optional `blocked_tools` (array of substrings or
`/regex/` patterns matched against `metadata.tool_name`) and provider-
specific knobs such as `masked_fields`, `mask_value`, or
`max_body_chars` (Confluence).

Example policy config for GitHub:

```json
{
  "blocked_tools": ["delete_repository", "force_push"],
  "masked_fields": ["email", "author_email", "token"]
}
```

## Adding a new provider

1. Add an entry to `provider/manifest.json` with `id`, `port`, and default
   guard rules (`blockedTools`, `maskedFields`, optional `tokenReplacers`).
2. Run `node provider/scripts/generate-providers.js` to scaffold
   `provider/<vendor>/data-guard/` and refresh `docker-compose.yml`,
   `deploy.sh`, and `tests/contract.js`.
3. Refine `index.js` if the provider needs custom logic beyond the shared
   `createDataGuardEvaluate` factory in `provider/_lib/data-guard.js`.
4. Add behaviour tests under `tests/` when you have realistic fixtures.

All provider filters in this directory are Apache 2.0, same as `common/`.
