#!/bin/bash

# Use ${VAR:-default} syntax to provide fallbacks if the env var is missing
ELASTICSEARCH="${ELASTICSEARCH:-elasticsearch:9200}"
KIBANA="${KIBANA:-kibana:5601}"

echo "RUNNING!!$ELASTICSEARCH!!!!!!$KIBANA!!!!!!!!!!!!!!!!!!!!!!!!!!!";

sleep 15;

filebeat setup -e --strict.perms=false \
  --index-management \
  --pipelines \
  --dashboards \
  --modules nginx,postgresql,elasticsearch,logstash,kibana \
  -M "nginx.access.enabled=true" \
  -M "nginx.error.enabled=true" \
  -M "postgresql.log.enabled=true" \
  -M "elasticsearch.server.enabled=true" \
  -M "logstash.log.enabled=true" \
  -M "kibana.log.enabled=true" \
  -E output.logstash.enabled=false \
  -E "output.elasticsearch.hosts=[$ELASTICSEARCH]" \
  -E "setup.kibana.host=$KIBANA"

echo "------code: $?-----------------------"


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
