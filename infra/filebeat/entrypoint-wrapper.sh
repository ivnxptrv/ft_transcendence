#!/bin/bash
# Run your custom logic
./init.sh

# Now start Filebeat using its original entrypoint/command
exec /usr/local/bin/docker-entrypoint "$@"
