#!/usr/bin/env sh
set -e

# Define your databases and their passwords in a string
# Format: "db_name:password"

DATABASES="\
    identity:identity_pass \
    ledger:ledger_pass \
    semantic:semantic_pass \
    "

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

        -- ADD THIS LINE to track queries for this specific database:
        CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
EOSQL
done

echo "Setting up postgres_exporter..."
EXPORTER_PASS=$(cat /run/secrets/postgres_exporter_pass)
# We run this against the default DB so the user is global
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create the monitoring user
    CREATE USER postgres_exporter WITH PASSWORD '$EXPORTER_PASS';
    
    -- Grant the magic role for monitoring (Postgres 10+)
    GRANT pg_monitor TO postgres_exporter;
    
    -- Optional: Allow it to see table sizes more accurately
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres_exporter;

    -- ADD THIS LINE so the exporter can read the global stats:
    CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
EOSQL

# DATABASES="identity:identity_pass ledger:ledger_pass semantic:semantic_pass"

# for entry in $DATABASES; do
#     DB_NAME=${entry%%:*}
#     DB_PASS=${entry#*:}
#     USER_NAME="${DB_NAME}_user"

#     echo "Configuring $DB_NAME for user $USER_NAME"

#     # 1. Superuser creates the ROLE first
#     psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#         CREATE USER $USER_NAME WITH PASSWORD '$DB_PASS' CREATEDB;
# EOSQL

#     # 2. NEW USER creates their own DATABASE
#     # We use PGPASSWORD so the script can log in as the new user without a prompt
#     export PGPASSWORD=$DB_PASS
#     psql -v ON_ERROR_STOP=1 --username "$USER_NAME" --dbname "$POSTGRES_DB" <<-EOSQL
#         CREATE DATABASE $DB_NAME;
# EOSQL

#     # 3. Fix permissions (New user is already owner, but we ensure schema control)
#     psql -v ON_ERROR_STOP=1 --username "$USER_NAME" --dbname "$DB_NAME" <<-EOSQL
#         ALTER SCHEMA public OWNER TO $USER_NAME;
# EOSQL
    
#     # Clean up the password variable for the next loop iteration
#     unse
