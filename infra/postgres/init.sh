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
EOSQL
done
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
