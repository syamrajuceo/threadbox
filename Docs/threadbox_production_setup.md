# Threadbox Production Setup Guide

This document contains the setup steps for deploying Threadbox to the `threadbox-production` GCP project.

## ✅ Completed Setup

1. **Project Active** ✓
   - Active Project: `threadbox-production`
   - Project Number: `488284799646`
   - Billing: Enabled ✓

2. **APIs Enabled** ✓
   - Cloud Build API
   - Cloud Run API
   - Cloud SQL Admin API
   - Container Registry API
   - Secret Manager API

3. **Region/Zone Configured** ✓
   - Region: `us-central1`
   - Zone: `us-central1-a`

4. **Service Account Created** ✓
   - Service Account: `github-actions@threadbox-production.iam.gserviceaccount.com`
   - Permissions: `roles/run.admin`, `roles/storage.admin`, `roles/iam.serviceAccountUser`

5. **Workload Identity Federation Configured** ✓
   - Workload Identity Pool: `github-actions-pool`
   - Provider: `github-provider`
   - Bound to: `syamrajuceo/threadbox` repository
   - **Note:** Using Workload Identity Federation (no service account keys needed - more secure!)

6. **Cloud SQL Instance Created** ✓
   - Instance Name: `threadbox-db`
   - Status: `RUNNABLE` (ready for use)
   - Location: `us-central1-a`
   - Tier: `db-f1-micro`
   - Primary IP: `35.184.68.5`
   - Connection Name: `threadbox-production:us-central1:threadbox-db`
   - Root Password: `fNoidykRznLb71o7s8qVUCV23` ⚠️ **SAVE THIS SECURELY**

## 📋 Next Steps

### Step 1: Set Up Database and User

✅ **Instance is ready!** Proceed with database setup.

**Option A: Use the setup script (Recommended)**
```bash
./scripts/setup-cloud-sql.sh
```

This script will:
- Verify the instance is ready
- Generate a secure password for the database user
- Create the `threadbox` database
- Create the `threadbox` user with proper permissions
- Display all connection details for GitHub Secrets

**Option B: Manual setup (Quick Reference)**
```bash
# Show manual instructions with pre-generated credentials
./scripts/setup-db-manual.sh

# Or connect manually:
gcloud sql connect threadbox-db --user=postgres --project=threadbox-production
# Password: fNoidykRznLb71o7s8qVUCV23

# Then run:
CREATE DATABASE threadbox;
CREATE USER threadbox WITH PASSWORD '9TPr9W0rU5jNeQo27O9CsuGQ3';
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
\c threadbox
GRANT ALL ON SCHEMA public TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO threadbox;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO threadbox;
\q
```

**Pre-generated credentials (for manual setup):**
- Database User: `threadbox`
- Database Password: `9TPr9W0rU5jNeQo27O9CsuGQ3` ⚠️ **SAVE THIS**

### Step 3: Get Database Connection Details

```bash
# Create PostgreSQL instance
gcloud sql instances create threadbox-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_ROOT_PASSWORD \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --project=threadbox-production

# Connect and create database
gcloud sql connect threadbox-db --user=postgres --project=threadbox-production

# In PostgreSQL prompt:
CREATE DATABASE threadbox;
CREATE USER threadbox WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
\q
```

### Step 3: Add GitHub Secrets

```bash
# Get instance connection name
gcloud sql instances describe threadbox-db --project=threadbox-production --format='value(connectionName)'

# Get public IP
gcloud sql instances describe threadbox-db --project=threadbox-production --format='value(ipAddresses[0].ipAddress)'
```

Go to: https://github.com/syamrajuceo/threadbox/settings/secrets/actions

Add the following secrets:

- **GCP_PROJECT_ID** = `threadbox-production`
- **DATABASE_HOST** = (Cloud SQL instance IP from step 2)
- **DATABASE_PORT** = `5432`
- **DATABASE_USER** = `threadbox`
- **DATABASE_PASSWORD** = (your database password)
- **DATABASE_NAME** = `threadbox`
- **JWT_SECRET** = (your JWT secret key)
- **JWT_EXPIRES_IN** = `24h`
- **CLAUDE_API_KEY** = (your Claude AI API key)

**Note:** `GCP_SA_KEY` is NOT needed - we're using Workload Identity Federation!

### Step 4: Deploy

**Automatic (via GitHub Actions):**
- Push to `main` branch after secrets are configured
- CI/CD will automatically build and deploy

**Manual:**
```bash
# Build and submit
gcloud builds submit --config cloudbuild.yaml --project=threadbox-production

# Or deploy directly
gcloud run deploy threadbox-backend \
  --image gcr.io/threadbox-production/threadbox-backend:latest \
  --platform managed \
  --region us-central1 \
  --project=threadbox-production \
  --allow-unauthenticated
```

## 🔧 Current Configuration

- **Project ID:** `threadbox-production`
- **Project Number:** `488284799646`
- **Billing Account:** `013023-DA4EB1-DFB632` (Enabled)
- **Region:** `us-central1`
- **Zone:** `us-central1-a`
- **Container Registry:** `gcr.io/threadbox-production`

## 📝 Resource Names

- **Cloud Run Services:** `threadbox-backend`, `threadbox-frontend`
- **Cloud SQL Instance:** `threadbox-db`
- **Service Account:** `github-actions@threadbox-production.iam.gserviceaccount.com`
- **Container Images:** `gcr.io/threadbox-production/threadbox-backend`, `gcr.io/threadbox-production/threadbox-frontend`

## 🔗 Quick Links

- **Cloud Console:** https://console.cloud.google.com/?project=threadbox-production
- **Cloud Run:** https://console.cloud.google.com/run?project=threadbox-production
- **Cloud SQL:** https://console.cloud.google.com/sql?project=threadbox-production
- **Cloud Build:** https://console.cloud.google.com/cloud-build?project=threadbox-production
- **GitHub Secrets:** https://github.com/syamrajuceo/threadbox/settings/secrets/actions

## ⚠️ Important Notes

1. **Workload Identity Federation:** We're using Workload Identity Federation instead of service account keys for better security. No keys needed!
2. **Database Password:** Use a strong, unique password
3. **JWT Secret:** Use a strong, random secret for production
4. **API Keys:** Keep all API keys secure in GitHub Secrets
5. **Billing:** All resources will be billed to this project

## 🚀 Ready to Deploy

Once you complete Steps 1-3, your app will automatically deploy when you push to the `main` branch!

