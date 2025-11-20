# Google Cloud Platform Deployment Guide

This guide provides step-by-step instructions for deploying Threadbox to Google Cloud Platform with CI/CD pipeline.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Setup (Cloud SQL)](#database-setup-cloud-sql)
4. [Git Repository Setup](#git-repository-setup)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Deployment](#deployment)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Google Cloud Account** with billing enabled
- **Google Cloud SDK (gcloud)** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
- **Git** installed and configured
- **GitHub Account** (for CI/CD)
- **Docker** installed (optional, for local testing)

---

## Initial Setup

### 1. Create Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create threadbox-production --name="Threadbox Production"

# Set the project as active
gcloud config set project threadbox-production

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  containerregistry.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Set Up Billing

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Billing** → **Link a billing account**
3. Link your billing account to the project

### 3. Configure Default Region

```bash
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

---

## Database Setup (Cloud SQL)

### 1. Create Cloud SQL PostgreSQL Instance

```bash
gcloud sql instances create threadbox-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_ROOT_PASSWORD \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log
```

**Note:** For production, use a higher tier (e.g., `db-n1-standard-1`)

### 2. Create Database and User

```bash
# Connect to the instance
gcloud sql connect threadbox-db --user=postgres

# In the PostgreSQL prompt, run:
CREATE DATABASE threadbox;
CREATE USER threadbox WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
\q
```

### 3. Get Database Connection Details

```bash
# Get the instance connection name
gcloud sql instances describe threadbox-db --format='value(connectionName)'

# Get the public IP (if needed)
gcloud sql instances describe threadbox-db --format='value(ipAddresses[0].ipAddress)'
```

### 4. Configure Private IP (Recommended for Production)

```bash
# Allocate IP range for private services
gcloud compute addresses create google-managed-services-default \
  --global \
  --purpose=VPC_PEERING \
  --prefix-length=16 \
  --network=default

# Create VPC peering
gcloud services vpc-peerings connect \
  --service=servicenetworking.googleapis.com \
  --ranges=google-managed-services-default \
  --network=default

# Update Cloud SQL instance to use private IP
gcloud sql instances patch threadbox-db \
  --network=default \
  --no-assign-ip
```

---

## Git Repository Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd /path/to/Threadbox

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Threadbox application"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `threadbox` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license

### 3. Connect Local Repository to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/threadbox.git

# Create and switch to main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### 4. Create Development Branch

```bash
git checkout -b develop
git push -u origin develop
```

---

## CI/CD Pipeline Setup

### Option 1: GitHub Actions (Recommended)

#### 1. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions CI/CD"

# Grant necessary permissions
gcloud projects add-iam-policy-binding threadbox-production \
  --member="serviceAccount:github-actions@threadbox-production.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding threadbox-production \
  --member="serviceAccount:github-actions@threadbox-production.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding threadbox-production \
  --member="serviceAccount:github-actions@threadbox-production.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@threadbox-production.iam.gserviceaccount.com
```

#### 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

   - **GCP_PROJECT_ID**: `threadbox-production`
   - **GCP_SA_KEY**: Contents of `github-actions-key.json` file
   - **DATABASE_HOST**: Your Cloud SQL instance IP or connection name
   - **DATABASE_PORT**: `5432`
   - **DATABASE_USER**: `threadbox`
   - **DATABASE_PASSWORD**: Your database password
   - **DATABASE_NAME**: `threadbox`
   - **JWT_SECRET**: Your JWT secret key
   - **JWT_EXPIRES_IN**: `24h`
   - **CLAUDE_API_KEY**: Your Claude AI API key
   - **NEXT_PUBLIC_API_URL**: (Optional, will be set automatically)

#### 3. Push Workflow File

The workflow file (`.github/workflows/ci-cd.yml`) should already be in your repository. If not, add it and commit:

```bash
git add .github/workflows/ci-cd.yml
git commit -m "Add GitHub Actions CI/CD workflow"
git push
```

### Option 2: Google Cloud Build

#### 1. Connect GitHub Repository to Cloud Build

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **Create Trigger**
3. Connect your GitHub repository
4. Select the repository and branch
5. Set configuration file to `cloudbuild.yaml`
6. Set substitution variables (see `cloudbuild.yaml` for required variables)

#### 2. Configure Substitution Variables

In the trigger settings, add these substitution variables:

- `_REGION`: `us-central1`
- `_DATABASE_HOST`: Your Cloud SQL instance IP
- `_DATABASE_PORT`: `5432`
- `_DATABASE_USER`: `threadbox`
- `_DATABASE_PASSWORD`: Your database password
- `_DATABASE_NAME`: `threadbox`
- `_JWT_SECRET`: Your JWT secret
- `_JWT_EXPIRES_IN`: `24h`
- `_CLAUDE_API_KEY`: Your Claude API key

---

## Deployment

### Automatic Deployment (via CI/CD)

Once CI/CD is set up, deployments happen automatically when you push to `main` branch:

```bash
# Make changes and commit
git add .
git commit -m "Your changes"
git push origin main

# CI/CD pipeline will automatically:
# 1. Run tests
# 2. Build Docker images
# 3. Push to Container Registry
# 4. Deploy to Cloud Run
```

### Manual Deployment

#### 1. Build and Push Images

```bash
# Authenticate Docker
gcloud auth configure-docker

# Build and push backend
docker build -f docker/Dockerfile.backend -t gcr.io/threadbox-production/threadbox-backend:latest ./backend
docker push gcr.io/threadbox-production/threadbox-backend:latest

# Build and push frontend
docker build -f docker/Dockerfile.frontend -t gcr.io/threadbox-production/threadbox-frontend:latest ./frontend
docker push gcr.io/threadbox-production/threadbox-frontend:latest
```

#### 2. Deploy Backend

```bash
gcloud run deploy threadbox-backend \
  --image gcr.io/threadbox-production/threadbox-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_HOST=YOUR_DB_HOST,DATABASE_PORT=5432,DATABASE_USER=threadbox,DATABASE_PASSWORD=YOUR_PASSWORD,DATABASE_NAME=threadbox,JWT_SECRET=YOUR_SECRET,JWT_EXPIRES_IN=24h,CLAUDE_API_KEY=YOUR_KEY,NODE_ENV=production" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

#### 3. Deploy Frontend

```bash
# Get backend URL
BACKEND_URL=$(gcloud run services describe threadbox-backend --region us-central1 --format 'value(status.url)')

# Deploy frontend
gcloud run deploy threadbox-frontend \
  --image gcr.io/threadbox-production/threadbox-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_API_URL=$BACKEND_URL,NEXT_PUBLIC_APP_NAME=Threadbox" \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

---

## Post-Deployment

### 1. Run Database Migrations

```bash
# Connect to Cloud Run backend
gcloud run services proxy threadbox-backend --region us-central1 --port 3001

# In another terminal, run migrations
# (You may need to add a migration script or use TypeORM CLI)
```

### 2. Create Super User

```bash
# Access backend container
gcloud run services proxy threadbox-backend --region us-central1 --port 3001

# Run seed script (if available)
# Or use your backend API to create super user
```

### 3. Get Service URLs

```bash
# Get frontend URL
gcloud run services describe threadbox-frontend --region us-central1 --format 'value(status.url)'

# Get backend URL
gcloud run services describe threadbox-backend --region us-central1 --format 'value(status.url)'
```

### 4. Configure Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service threadbox-frontend \
  --domain yourdomain.com \
  --region us-central1
```

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

- Check Cloud Build logs in Google Cloud Console
- Verify Dockerfile paths are correct
- Ensure all dependencies are in package.json

#### 2. Deployment Failures

- Check Cloud Run logs: `gcloud run services logs read threadbox-backend --region us-central1`
- Verify environment variables are set correctly
- Check database connectivity

#### 3. Database Connection Issues

- Verify Cloud SQL instance is running
- Check firewall rules allow Cloud Run to connect
- Verify connection name and credentials

#### 4. Frontend Can't Connect to Backend

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend URL is accessible

### Useful Commands

```bash
# View Cloud Run logs
gcloud run services logs read threadbox-backend --region us-central1 --limit 50

# View Cloud Build logs
gcloud builds list --limit=10

# Check service status
gcloud run services describe threadbox-backend --region us-central1

# Update environment variables
gcloud run services update threadbox-backend \
  --region us-central1 \
  --update-env-vars KEY=VALUE

# Scale service
gcloud run services update threadbox-backend \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 10
```

---

## Cost Optimization

### Free Tier Limits

- **Cloud Run**: 2 million requests/month free
- **Cloud SQL**: db-f1-micro instance eligible for free tier
- **Cloud Build**: 120 build-minutes/day free

### Cost-Saving Tips

1. Use `--min-instances 0` to scale to zero when not in use
2. Use smaller instance sizes for development
3. Enable Cloud SQL automatic backups only for production
4. Use Cloud Build substitution variables instead of secrets for non-sensitive data

---

## Security Best Practices

1. **Use Secret Manager** for sensitive data:
   ```bash
   # Create secret
   echo -n "your-secret" | gcloud secrets create jwt-secret --data-file=-
   
   # Grant access to Cloud Run
   gcloud secrets add-iam-policy-binding jwt-secret \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

2. **Enable VPC Connector** for private database access
3. **Use IAM** for fine-grained access control
4. **Enable Cloud Armor** for DDoS protection
5. **Regularly update** dependencies and base images

---

## Next Steps

- Set up monitoring with Cloud Monitoring
- Configure alerts for errors and performance
- Set up staging environment
- Implement blue-green deployments
- Add automated testing to CI/CD pipeline

---

## Support

For issues or questions:
- Check [Cloud Run Documentation](https://cloud.google.com/run/docs)
- Review [Cloud Build Documentation](https://cloud.google.com/build/docs)
- Check application logs in Cloud Console

