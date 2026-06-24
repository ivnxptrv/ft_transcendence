#!/usr/bin/env sh

set -e

# # Read secrets from mounted files
DB_PASS=$(cat /run/secrets/postgres_interaction_pass)

export WEB_URL="http://${WEB_HOST}:${WEB_PORT}";
export IDENTITY_URL="http://${IDENTITY_HOST}:${IDENTITY_PORT}";
export LEDGER_URL="http://${LEDGER_HOST}:${LEDGER_PORT}";
export SEMANTIC_URL="http://${SEMANTIC_HOST}:${SEMANTIC_PORT}";
export INTERACTION_URL="http://${INTERACTION_HOST}:${INTERACTION_PORT}";

export DATABASE_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "$DATABASE_URL"

set -e
alembic upgrade head

echo "$@"
exec "$@"
