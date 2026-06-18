#!/bin/bash
# Deploy MCP filters (common + provider) to the remote box.
set -e

SERVER_IP="${SERVER_IP:-172.16.1.86}"
REMOTE_USER="${REMOTE_USER:-ashankar}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_genai}"
DEPLOY_PATH="${DEPLOY_PATH:-~/mcp-filters}"
SSH_OPTS="-i ${SSH_KEY} -o StrictHostKeyChecking=no"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COMMON_FILTERS=(
  "sql-guard:6001"
  "pii-redactor:6002"
  "row-limiter:6003"
  "schema-validator:6005"
  "rate-limiter:6007"
  "field-masker:6008"
)

PROVIDER_FILTERS=(
  "aws-data-guard:6301:provider/aws/data-guard/Dockerfile"
  "asana-data-guard:6302:provider/asana/data-guard/Dockerfile"
  "atlassian-data-guard:6303:provider/atlassian/data-guard/Dockerfile"
  "confluence-data-guard:6304:provider/confluence/data-guard/Dockerfile"
  "github-data-guard:6305:provider/github/data-guard/Dockerfile"
  "azure-data-guard:6306:provider/azure/data-guard/Dockerfile"
  "bigquery-data-guard:6307:provider/bigquery/data-guard/Dockerfile"
  "brave-search-data-guard:6308:provider/brave-search/data-guard/Dockerfile"
  "browserbase-data-guard:6309:provider/browserbase/data-guard/Dockerfile"
  "calendar-data-guard:6310:provider/calendar/data-guard/Dockerfile"
  "cloudflare-data-guard:6311:provider/cloudflare/data-guard/Dockerfile"
  "databricks-data-guard:6312:provider/databricks/data-guard/Dockerfile"
  "datadog-data-guard:6313:provider/datadog/data-guard/Dockerfile"
  "deepwiki-data-guard:6314:provider/deepwiki/data-guard/Dockerfile"
  "digitalocean-data-guard:6315:provider/digitalocean/data-guard/Dockerfile"
  "duckduckgo-data-guard:6316:provider/duckduckgo/data-guard/Dockerfile"
  "dynatrace-data-guard:6317:provider/dynatrace/data-guard/Dockerfile"
  "elasticsearch-data-guard:6318:provider/elasticsearch/data-guard/Dockerfile"
  "exa-search-data-guard:6319:provider/exa-search/data-guard/Dockerfile"
  "filescom-data-guard:6320:provider/filescom/data-guard/Dockerfile"
  "firecrawl-data-guard:6321:provider/firecrawl/data-guard/Dockerfile"
  "gitlab-data-guard:6322:provider/gitlab/data-guard/Dockerfile"
  "gmail-data-guard:6323:provider/gmail/data-guard/Dockerfile"
  "google-data-guard:6324:provider/google/data-guard/Dockerfile"
  "grafana-data-guard:6325:provider/grafana/data-guard/Dockerfile"
  "hubspot-data-guard:6326:provider/hubspot/data-guard/Dockerfile"
  "linear-data-guard:6327:provider/linear/data-guard/Dockerfile"
  "markitdown-data-guard:6328:provider/markitdown/data-guard/Dockerfile"
  "microsoft-data-guard:6329:provider/microsoft/data-guard/Dockerfile"
  "mondaycom-data-guard:6330:provider/mondaycom/data-guard/Dockerfile"
  "mongodb-data-guard:6331:provider/mongodb/data-guard/Dockerfile"
  "morningstar-data-guard:6332:provider/morningstar/data-guard/Dockerfile"
  "mysql-data-guard:6333:provider/mysql/data-guard/Dockerfile"
  "neon-data-guard:6334:provider/neon/data-guard/Dockerfile"
  "notion-data-guard:6335:provider/notion/data-guard/Dockerfile"
  "onedrive-data-guard:6336:provider/onedrive/data-guard/Dockerfile"
  "outlook-data-guard:6337:provider/outlook/data-guard/Dockerfile"
  "pagerduty-data-guard:6338:provider/pagerduty/data-guard/Dockerfile"
  "paypal-data-guard:6339:provider/paypal/data-guard/Dockerfile"
  "playwright-data-guard:6340:provider/playwright/data-guard/Dockerfile"
  "postgresql-data-guard:6341:provider/postgresql/data-guard/Dockerfile"
  "postman-data-guard:6342:provider/postman/data-guard/Dockerfile"
  "redis-data-guard:6343:provider/redis/data-guard/Dockerfile"
  "salesforce-data-guard:6344:provider/salesforce/data-guard/Dockerfile"
  "slack-data-guard:6345:provider/slack/data-guard/Dockerfile"
  "snowflake-data-guard:6346:provider/snowflake/data-guard/Dockerfile"
  "square-data-guard:6347:provider/square/data-guard/Dockerfile"
  "stripe-data-guard:6348:provider/stripe/data-guard/Dockerfile"
  "supabase-data-guard:6349:provider/supabase/data-guard/Dockerfile"
  "tableau-data-guard:6350:provider/tableau/data-guard/Dockerfile"
  "tavily-search-data-guard:6351:provider/tavily-search/data-guard/Dockerfile"
  "terraform-data-guard:6352:provider/terraform/data-guard/Dockerfile"
  "wordpress-data-guard:6353:provider/wordpress/data-guard/Dockerfile"
  "zapier-data-guard:6354:provider/zapier/data-guard/Dockerfile"
)

echo -e "${YELLOW}[1/4] Building filter images for linux/amd64...${NC}"
for entry in "${COMMON_FILTERS[@]}"; do
    slug="${entry%%:*}"
    image="mcp-filter-${slug}:latest"
    echo "  building ${image}"
    docker buildx build --platform linux/amd64 --no-cache \
        -t "${image}" --load "${SCRIPT_DIR}/common/${slug}"
done

for entry in "${PROVIDER_FILTERS[@]}"; do
    slug="${entry%%:*}"
    dockerfile="${entry##*:}"
    image="mcp-filter-${slug}:latest"
    echo "  building ${image}"
    docker buildx build --platform linux/amd64 --no-cache \
        -f "${SCRIPT_DIR}/${dockerfile}" \
        -t "${image}" --load "${SCRIPT_DIR}/provider"
done

ALL_FILTERS=("${COMMON_FILTERS[@]}" "${PROVIDER_FILTERS[@]}")

echo -e "${YELLOW}[2/4] Saving images and shipping to ${SERVER_IP}...${NC}"
ssh ${SSH_OPTS} ${REMOTE_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"
for entry in "${ALL_FILTERS[@]}"; do
    slug="${entry%%:*}"
    image="mcp-filter-${slug}:latest"
    tarball="/tmp/mcp-filter-${slug}.tar.gz"
    docker save "${image}" | gzip > "${tarball}"
    scp ${SSH_OPTS} "${tarball}" "${REMOTE_USER}@${SERVER_IP}:${DEPLOY_PATH}/"
    rm -f "${tarball}"
done
scp ${SSH_OPTS} "${SCRIPT_DIR}/docker-compose.yml" "${REMOTE_USER}@${SERVER_IP}:${DEPLOY_PATH}/docker-compose.yml"

echo -e "${YELLOW}[3/4] Loading images and starting filters...${NC}"
ssh ${SSH_OPTS} ${REMOTE_USER}@${SERVER_IP} bash -s <<EOF
set -e
cd ${DEPLOY_PATH}
for f in mcp-filter-*.tar.gz; do
    gunzip -f "\$f"
    docker load -i "\${f%.gz}"
    rm -f "\${f%.gz}"
done

sed -i 's|^\s*build:.*$||g' docker-compose.yml || true
sed -i '/^\s*context:/d' docker-compose.yml || true
sed -i '/^\s*dockerfile:/d' docker-compose.yml || true

docker compose up -d
docker compose ps
EOF

echo -e "${YELLOW}[4/4] Updating filter_url rows in project_hub DB...${NC}"
cat <<'PSQL' > /tmp/update_filter_urls.sql
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6001/filter' WHERE slug = 'sql-guard';
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6002/filter' WHERE slug = 'pii-redactor';
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6003/filter' WHERE slug = 'row-limiter';
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6005/filter' WHERE slug = 'schema-validator';
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6007/filter' WHERE slug = 'rate-limiter';
UPDATE project_hub.ablv_mcp_filters SET filter_url = 'http://172.16.1.86:6008/filter' WHERE slug = 'field-masker';
PSQL
scp ${SSH_OPTS} /tmp/update_filter_urls.sql ${REMOTE_USER}@${SERVER_IP}:/tmp/update_filter_urls.sql
ssh ${SSH_OPTS} ${REMOTE_USER}@${SERVER_IP} 'docker cp /tmp/update_filter_urls.sql hub-backend:/app/u.sql && docker exec hub-backend node -e "
const fs = require(\"fs\");
const { getTenantInfo, getTenantConnection } = require(\"./src/db/tenant-db\");
(async () => {
  const sql = fs.readFileSync(\"/app/u.sql\", \"utf8\");
  const { tenants } = getTenantInfo();
  const seq = await getTenantConnection(tenants[0].tenant_id);
  await seq.query(sql);
  console.log(\"filter_url rows updated\");
  process.exit(0);
})();
"'
rm -f /tmp/update_filter_urls.sql

echo ""
echo -e "${GREEN}Deployed common and provider filters.${NC}"
for entry in "${ALL_FILTERS[@]}"; do
    slug="${entry%%:*}"
    port="${entry#*:}"; port="${port%%:*}"
    echo "  ${slug} -> http://${SERVER_IP}:${port}/health"
done
