#!/usr/bin/env python3
"""
Automated database setup script for Cloud SQL
Uses Cloud SQL Proxy to connect and execute SQL commands
"""

import subprocess
import sys
import time
import os

PROJECT_ID = "threadbox-production"
INSTANCE_NAME = "threadbox-db"
ROOT_PASSWORD = "fNoidykRznLb71o7s8qVUCV23"
DB_NAME = "threadbox"
DB_USER = "threadbox"
DB_PASSWORD = "9TPr9W0rU5jNeQo27O9CsuGQ3"

# SQL commands to execute
SQL_COMMANDS = f"""
CREATE DATABASE {DB_NAME};
CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};
\\c {DB_NAME}
GRANT ALL ON SCHEMA public TO {DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {DB_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {DB_USER};
\\q
"""

def main():
    print("🔧 Setting up Cloud SQL database...")
    print(f"   Instance: {INSTANCE_NAME}")
    print(f"   Project: {PROJECT_ID}")
    print()
    
    # Create SQL file
    sql_file = "/tmp/db_setup_commands.sql"
    with open(sql_file, 'w') as f:
        f.write(SQL_COMMANDS)
    
    print("📝 SQL commands prepared")
    print()
    
    # Try using gcloud beta sql connect with the proxy
    print("🔌 Connecting to Cloud SQL instance...")
    print("   (This may take a moment)")
    print()
    
    # Use expect-like approach with subprocess
    try:
        # Use gcloud beta sql connect with input
        process = subprocess.Popen(
            ['gcloud', 'beta', 'sql', 'connect', INSTANCE_NAME,
             '--user=postgres', f'--project={PROJECT_ID}'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Send password and SQL commands
        input_data = f"{ROOT_PASSWORD}\n{SQL_COMMANDS}"
        stdout, stderr = process.communicate(input=input_data, timeout=120)
        
        if process.returncode == 0:
            print("✅ Database setup completed successfully!")
            print()
            print("📋 Connection details for GitHub Secrets:")
            print(f"   DATABASE_HOST = 35.184.68.5")
            print(f"   DATABASE_PORT = 5432")
            print(f"   DATABASE_USER = {DB_USER}")
            print(f"   DATABASE_PASSWORD = {DB_PASSWORD}")
            print(f"   DATABASE_NAME = {DB_NAME}")
            print()
            return 0
        else:
            print("❌ Error setting up database")
            print(f"   Error: {stderr}")
            return 1
            
    except subprocess.TimeoutExpired:
        print("⏱️  Connection timed out")
        print("   Please try running the manual setup script:")
        print("   ./scripts/setup-db-manual.sh")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Please try running the manual setup script:")
        print("   ./scripts/setup-db-manual.sh")
        return 1

if __name__ == "__main__":
    sys.exit(main())

