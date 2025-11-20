#!/bin/bash

# Manual database setup instructions
# Use this if the automated script doesn't work

PROJECT_ID="threadbox-production"
INSTANCE_NAME="threadbox-db"
DB_NAME="threadbox"
DB_USER="threadbox"
DB_PASSWORD="9TPr9W0rU5jNeQo27O9CsuGQ3"  # Generated secure password
ROOT_PASSWORD="fNoidykRznLb71o7s8qVUCV23"  # Root password

echo "📋 Manual Database Setup Instructions"
echo ""
echo "1. Connect to Cloud SQL instance:"
echo "   gcloud sql connect $INSTANCE_NAME --user=postgres --project=$PROJECT_ID"
echo ""
echo "2. When prompted, enter the root password: $ROOT_PASSWORD"
echo ""
echo "3. Run these SQL commands:"
echo ""
echo "   CREATE DATABASE $DB_NAME;"
echo "   CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
echo "   GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "   \\c $DB_NAME"
echo "   GRANT ALL ON SCHEMA public TO $DB_USER;"
echo "   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
echo "   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
echo "   \\q"
echo ""
echo "4. Save these credentials for GitHub Secrets:"
echo ""
echo "   DATABASE_HOST = 35.184.68.5"
echo "   DATABASE_PORT = 5432"
echo "   DATABASE_USER = $DB_USER"
echo "   DATABASE_PASSWORD = $DB_PASSWORD"
echo "   DATABASE_NAME = $DB_NAME"
echo ""
echo "   Connection Name:"
gcloud sql instances describe $INSTANCE_NAME --project=$PROJECT_ID --format='value(connectionName)'
echo ""

