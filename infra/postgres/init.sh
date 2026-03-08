#!/usr/bin/env sh
set -e

# Define your databases and their passwords in a string
# Format: "db_name:password"
DATABASES="identity:identity_pass ledger:ledger_pass semantic:semantic_pass"

for entry in $DATABASES; do
    # Split the string by the colon
    DB_NAME=${entry%%:*}
    DB_PASS=${entry#*:}

    echo "Initializing database: $DB_NAME"

    # Run psql for this specific database
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE USER ${DB_NAME}_user WITH PASSWORD '$DB_PASS';
        CREATE DATABASE $DB_NAME;
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO ${DB_NAME}_user;
        
        -- Switch to the new DB to fix permissions (Postgres 15+)
        \c $DB_NAME
        ALTER SCHEMA public OWNER TO ${DB_NAME}_user;
EOSQL
done
