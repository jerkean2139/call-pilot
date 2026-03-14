#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h localhost -U coretrack; do
  sleep 1
done

echo "PostgreSQL is ready!"

# Apply the schema
echo "Applying database schema..."
psql -h localhost -U coretrack -d coretrack -f /docker-entrypoint-initdb.d/20250311012603_nameless_torch.sql

echo "Database initialization complete!"
