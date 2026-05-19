#!/usr/bin/env sh

set -e

# # Read secrets from mounted files
DB_PASS=$(cat /run/secrets/postgres_identity_pass)

# # Build the full URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
echo "$DATABASE_URL"

npx prisma migrate deploy
echo "$@"

# Setup certificates
if [ ! -f "${JWT_PRIVATE_KEY_PATH:-/app/keys/private.pem}" ]; then
    mkdir -p "$(dirname "${JWT_PRIVATE_KEY_PATH:-/app/keys/private.pem}")"
    openssl genrsa -out "${JWT_PRIVATE_KEY_PATH:-/app/keys/private.pem}" 2048
    openssl rsa -in "${JWT_PRIVATE_KEY_PATH:-/app/keys/private.pem}" \
            -pubout -out "${JWT_PUBLIC_KEY_PATH:-/app/keys/public.pem}"
fi
exec "$@"
