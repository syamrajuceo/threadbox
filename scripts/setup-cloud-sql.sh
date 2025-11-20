#!/bin/bash

# Cloud SQL Database Setup Script for Threadbox
# This script helps set up the database and user after Cloud SQL instance is ready

set -e

PROJECT_ID="threadbox-production"
INSTANCE_NAME="threadbox-db"
DB_NAME="threadbox"
DB_USER="threadbox"

echo "🔍 Checking Cloud SQL instance status..."

# Check if instance exists and get status
STATUS=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format="value(state)" 2>/dev/null || echo "NOT_FOUND")

if [ "$STATUS" = "NOT_FOUND" ]; then
    echo "❌ Error: Instance '$INSTANCE_NAME' not found in project '$PROJECT_ID'"
    exit 1
fi

if [ "$STATUS" != "RUNNABLE" ]; then
    echo "⏳ Instance is in state: $STATUS"
    echo "   Please wait for the instance to be in 'RUNNABLE' state before proceeding."
    echo ""
    echo "   Check status with:"
    echo "   gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(state)'"
    exit 1
fi

echo "✅ Instance is ready (RUNNABLE)"
echo ""

# Generate secure password for database user
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "🔐 Generated secure password for database user: $DB_PASSWORD"
echo "   ⚠️  SAVE THIS PASSWORD - you'll need it for GitHub Secrets!"
echo ""

# Get connection details
echo "📋 Getting connection details..."
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(connectionName)')
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(ipAddresses[0].ipAddress)')

echo "   Connection Name: $CONNECTION_NAME"
echo "   Public IP: $PUBLIC_IP"
echo ""

# Prompt for root password
echo "Enter the root password for the Cloud SQL instance:"
read -s ROOT_PASSWORD

echo ""
echo "🔧 Creating database and user..."
echo "   (This will open an interactive PostgreSQL session)"
echo ""

# Connect and create database/user
# Note: gcloud sql connect uses Cloud SQL Proxy automatically
PGPASSWORD="$ROOT_PASSWORD" gcloud sql connect $INSTANCE_NAME --user=postgres --project=$PROJECT_ID --quiet <<EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

-- Connect to the new database and grant schema privileges
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📝 Add these to GitHub Secrets (https://github.com/syamrajuceo/threadbox/settings/secrets/actions):"
echo ""
echo "   DATABASE_HOST = $PUBLIC_IP"
echo "   DATABASE_PORT = 5432"
echo "   DATABASE_USER = $DB_USER"
echo "   DATABASE_PASSWORD = $DB_PASSWORD"
echo "   DATABASE_NAME = $DB_NAME"
echo ""
echo "   Connection Name (for Cloud Run): $CONNECTION_NAME"
echo ""

