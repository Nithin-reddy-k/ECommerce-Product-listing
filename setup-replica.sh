#!/bin/sh
set -e

echo "================================================"
echo "Starting Replica Setup Process"
echo "================================================"

# Function to check if master is ready for replication
check_master_replication() {
  PGPASSWORD="${REPLICATION_PASSWORD}" psql \
    -h postgres-master \
    -U "${REPLICATION_USER}" \
    -d postgres \
    -c "SELECT 1" > /dev/null 2>&1
}

# Wait for master to be ready for replication
echo "Waiting for master to be ready for replication..."
ATTEMPT=0
MAX_ATTEMPTS=30

until check_master_replication; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "ERROR: Master did not become ready for replication in time"
    echo "Check master logs: docker logs postgres-master"
    exit 1
  fi
  echo "Waiting for master replication readiness... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

echo "✓ Master is ready for replication!"

# Additional wait to ensure replication slot is created
echo "Waiting additional 3 seconds for replication slot setup..."
sleep 3

# Check if data directory is already initialized
if [ -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo "Data directory already initialized. Starting replica..."
else
  echo "Data directory empty. Performing base backup..."
  
  # Clear any partial data
  rm -rf /var/lib/postgresql/data/*
  
  # Perform base backup with proper line continuation
  echo "Starting base backup from master..."
  PGPASSWORD="${REPLICATION_PASSWORD}" pg_basebackup \
    -h postgres-master \
    -D /var/lib/postgresql/data \
    -U "${REPLICATION_USER}" \
    -Fp \
    -Xs \
    -P \
    -R \
    -S replication_slot || {
      echo "ERROR: Base backup failed!"
      echo "Possible causes:"
      echo "  1. Master not ready"
      echo "  2. Replication user credentials incorrect"
      echo "  3. Replication slot already exists"
      echo ""
      echo "Try: docker-compose down -v && docker-compose up -d"
      exit 1
    }
  
  echo "✓ Base backup completed successfully"
  
  # Override replication configuration for ASYNC
  cat > /var/lib/postgresql/data/postgresql.auto.conf <<EOF
# Replication Configuration (Asynchronous)
primary_conninfo = 'host=postgres-master port=5432 user=${REPLICATION_USER} password=${REPLICATION_PASSWORD}'
primary_slot_name = 'replication_slot'
hot_standby = on
EOF
  
  echo "✓ Replication configuration written"
  
  # Ensure standby.signal exists
  touch /var/lib/postgresql/data/standby.signal
  
  # Set correct permissions
  chmod 0700 /var/lib/postgresql/data
  chown -R postgres:postgres /var/lib/postgresql/data
  
  echo "✓ Permissions set correctly"
fi

echo "================================================"
echo "Starting PostgreSQL Replica Server"
echo "================================================"

# Start PostgreSQL
exec su-exec postgres postgres \
  -c hot_standby=on \
  -c logging_collector=on \
  -c log_directory=/var/lib/postgresql/data/log \
  -c log_filename=postgresql-%Y-%m-%d.log