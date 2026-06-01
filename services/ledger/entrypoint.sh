#!/bin/bash
set -e

# Read password from Docker Secret
if [ -f /run/secrets/postgres_ledger_pass ]; then
    DB_PASS=$(cat /run/secrets/postgres_ledger_pass)
else
    echo "Secret not found, using env DB_PASS"
    DB_PASS=${DB_PASS:-password}
fi

# Construct Async URL
export DATABASE_URL="postgresql+asyncpg://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Checking for config files..."
ls -la /app  # This will print the file list in your logs

DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
# NEW: Wait for Postgres to be ready
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Database is up!"

echo "Running migrations..."
alembic upgrade head

echo "Running migrations..."
alembic upgrade head

echo "Starting Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000