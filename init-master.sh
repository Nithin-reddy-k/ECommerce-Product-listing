#!/bin/bash
set -e


# We are waiting until POstgreSQl container is ready
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
    echo "Waiting for POstgreSQL to be ready..."
    sleep 2
done

echo "POstgreSQL is ready. Configuring replication..."


# Creating a replication user(on master)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- check if replication user exists
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${REPLICATION_USER}') THEN
            CREATE ROLE ${REPLICATION_USER} WITH REPLICATION PASSWORD '${REPLICATION_PASSWORD}' LOGIN;
            RAISE NOTICE 'Replication user ${REPLICATION_USER} created';
        ELSE
            RAISE NOTICE 'Replication user ${REPLICATION_USER} already exists';
        END IF;
    END
    \$\$;

    -- Create replication slot
    SELECT pg_create_physical_replication_slot('replication_slot');
EOSQL


# COnfiguriong pg_hba.conf for replication 
echo "host replication ${REPLICATION_USER} 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"

echo "Master initialization complete"