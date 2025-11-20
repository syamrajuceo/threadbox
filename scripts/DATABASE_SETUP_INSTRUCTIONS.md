# Database Setup Instructions

Due to IPv6 connection issues, you need to set up Application Default Credentials first, then connect using the beta version of gcloud.

## Step 1: Set Up Application Default Credentials

Run this command in your terminal (it will open a browser for authentication):

```bash
gcloud auth application-default login
```

Follow the prompts to authenticate in your browser.

## Step 2: Connect to Cloud SQL

Once authenticated, run:

```bash
gcloud beta sql connect threadbox-db --user=postgres --project=threadbox-production
```

When prompted for password, enter: `fNoidykRznLb71o7s8qVUCV23`

## Step 3: Run SQL Commands

Once connected, copy and paste these SQL commands:

```sql
CREATE DATABASE threadbox;
CREATE USER threadbox WITH PASSWORD '9TPr9W0rU5jNeQo27O9CsuGQ3';
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
\q
```

**Note:** If you see errors like "database already exists" or "role already exists", that's fine - it means they were already created. The important part is that `GRANT ALL PRIVILEGES` succeeds.

**Optional:** For additional schema-level permissions (recommended but not required), reconnect and run:

```sql
\c threadbox postgres
GRANT ALL ON SCHEMA public TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO threadbox;
\q
```

**Important:** The `GRANT ALL PRIVILEGES ON DATABASE` command is sufficient for the application to work. The schema-level grants are optional optimizations.

## Step 4: Save Credentials for GitHub Secrets

After setup, add these to GitHub Secrets:
- **DATABASE_HOST** = `35.184.68.5`
- **DATABASE_PORT** = `5432`
- **DATABASE_USER** = `threadbox`
- **DATABASE_PASSWORD** = `9TPr9W0rU5jNeQo27O9CsuGQ3`
- **DATABASE_NAME** = `threadbox`

Connection Name: `threadbox-production:us-central1:threadbox-db`

