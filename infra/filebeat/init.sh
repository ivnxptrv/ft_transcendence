#!/bin/bash

# Use ${VAR:-default} syntax to provide fallbacks if the env var is missing
ELASTICSEARCH="${ELASTICSEARCH:-elasticsearch:9200}"
KIBANA="${KIBANA:-kibana:5601}"

echo "RUNNING!!$ELASTICSEARCH!!!!!!$KIBANA!!!!!!!!!!!!!!!!!!!!!!!!!!!";

until curl -s http://$ELASTICSEARCH > /dev/null; do
  sleep 5
done

until curl -s http://$KIBANA > /dev/null; do
  sleep 5
done

echo "Waiting for Elasticsearch to finish pending tasks..."
MAX_RETRIES=60   # 5 minutes total (60 * 5s)
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    pending=$(curl -s "http://$ELASTICSEARCH/_cluster/pending_tasks")
    if echo "$pending" | grep -q '"tasks":\[\]'; then
        echo "No pending tasks found."
        break
    fi
    echo "Still have pending tasks. Waiting 5 seconds... ($((MAX_RETRIES - RETRY_COUNT)) attempts left)"
    sleep 15
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# filebeat setup -e --strict.perms=false \
#     --pipelines \
#     --enable-all-filesets \
#     --dashboards \
# #     --index-management \
# #     -E "output.logstash.enabled=false" \
# #     -E "output.elasticsearch.hosts=[$ELASTICSEARCH]" 


# filebeat setup -e --strict.perms=false \
#     --pipelines \
#     --enable-all-filesets \
#     --index-management \
#     -E "output.logstash.enabled=false" \
#     -E "output.elasticsearch.hosts=[elasticsearch:9200]" 


# filebeat setup -e --strict.perms=false \
#     --pipelines \
#     --enable-all-filesets \
#     --dashboards \
#     --index-management \
#     -E "output.logstash.enabled=false" \
#     -E "output.elasticsearch.hosts=[mitmproxy:8081]" 

# filebeat setup -e --strict.perms=false \
#   --index-management \
#   --pipelines \
#   --dashboards \
#   --modules nginx,postgresql,elasticsearch,logstash,kibana \
#   -M "nginx.access.enabled=true" \
#   -M "nginx.error.enabled=true" \
#   -M "postgresql.log.enabled=true" \
#   -M "elasticsearch.server.enabled=true" \
#   -M "logstash.log.enabled=true" \
#   -M "kibana.log.enabled=true" \
#   -E "output.logstash.enabled=false" \
#   -E "output.elasticsearch.hosts=[$ELASTICSEARCH]" \
#   -E "setup.kibana.host=$KIBANA"


filebeat setup -e --strict.perms=false \
  --index-management \
  --pipelines \
  --dashboards \
  --enable-all-filesets \
  --modules nginx,postgresql,elasticsearch,logstash,kibana \
  -M "nginx.access.enabled=true" \
  -M "nginx.error.enabled=true" \
  -M "postgresql.log.enabled=true" \
  -M "elasticsearch.server.enabled=true" \
  -M "logstash.log.enabled=true" \
  -M "kibana.log.enabled=true" \
  -E "output.logstash.enabled=false" \
  -E "output.elasticsearch.hosts=[elasticsearch:9200]" \
  -E "setup.kibana.host=kibana:5601"

curl -X PUT "http://$ELASTICSEARCH/_ilm/policy/filebeat" \
     -H 'Content-Type: application/json' \
     -d @/usr/share/filebeat/policy.json

echo "------code: $?-----------------------"

# filebeat setup -e --strict.perms=false \
#  --modules nginx,postgresql


# filebeat setup -e --strict.perms=false \
#   --modules nginx,postgresql,elasticsearch,logstash,kibana \
#   -E "output.logstash.enabled=false" \
#   -E "output.elasticsearch.hosts=[$ELASTICSEARCH]" 

# docker exec -it filebeat filebeat setup -e --strict.perms=false \
#   --index-management \
#   --pipelines \
#   --dashboards \
#   --modules nginx,postgresql,elasticsearch,logstash,kibana \
#   -M "nginx.access.enabled=true" \
#   -M "nginx.error.enabled=true" \
#   -M "postgresql.log.enabled=true" \
#   -M "elasticsearch.server.enabled=true" \
#   -M "logstash.log.enabled=true" \
#   -M "kibana.log.enabled=true" \
#   -E output.logstash.enabled=false \
#   -E "output.elasticsearch.hosts=[\"$ELASTICSEARCH\"]" \
#   -E "setup.kibana.host=\"$KIBANA\""

# docker exec -it filebeat filebeat setup -e --strict.perms=false \
#   --index-management \
#   --pipelines \
#   --dashboards \
#   --modules nginx,postgresql,elasticsearch,logstash,kibana \
#   -M "nginx.access.enabled=true" \
#   -M "nginx.error.enabled=true" \
#   -M "postgresql.log.enabled=true" \
#   -M "elasticsearch.server.enabled=true" \
#   -M "logstash.log.enabled=true" \
#   -M "kibana.log.enabled=true" \
#   -E output.logstash.enabled=false \
#   -E "output.elasticsearch.hosts=[\"elasticsearch:9200\"]" \
#   -E "setup.kibana.host=\"kibana:5601\""
