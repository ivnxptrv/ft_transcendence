#!/usr/bin/env sh

set -e
export GOOGLE_CLIENT_SECRET="$(cat /run/secrets/web_google_client)"

export WEB_URL="http://${WEB_HOST}:${WEB_PORT}";
export IDENTITY_URL="http://${IDENTITY_HOST}:${IDENTITY_PORT}";
export LEDGER_URL="http://${LEDGER_HOST}:${LEDGER_PORT}";
export SEMANTIC_URL="http://${SEMANTIC_HOST}:${SEMANTIC_PORT}";
export INTERACTION_URL="http://${INTERACTION_HOST}:${INTERACTION_PORT}";
exec "$@"
