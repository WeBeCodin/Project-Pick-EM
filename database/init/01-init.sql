#!/bin/bash
# Database initialization script for NFL Pick 'Em application
# This script runs when the PostgreSQL container starts for the first time

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Create additional databases for testing
    CREATE DATABASE nfl_pickem_test;
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE nfl_pickem TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE nfl_pickem_test TO $POSTGRES_USER;
    
    -- Set timezone
    SET timezone = 'UTC';
    
    -- Log initialization
    \echo 'NFL Pick Em databases initialized successfully'
EOSQL
