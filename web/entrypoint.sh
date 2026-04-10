#!/usr/bin/env sh

set -e

# Read secrets from mounted files
DB_PASS=$(cat /run/secrets/postgres_web_pass)

# Build the full URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "$DATABASE_URL"
# Wait for database it will not work as image built on top of node
# until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
#   echo "Waiting for database..."
#   sleep 2
# done

npx prisma migrate deploy
npx prisma generate

exec "$@"
