#!/usr/bin/env sh

set -e

# # Read secrets from mounted files
DB_PASS=$(cat /run/secrets/postgres_identity_pass)

# # Build the full URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "$DATABASE_URL"

npx prisma migrate deploy
echo "$@"
exec "$@"
