# Quick Start: Git & GCP Deployment

This is a quick reference guide for setting up Git and deploying to Google Cloud Platform.

## Quick Setup Checklist

### 1. Git Setup (5 minutes)

```bash
# Initialize Git (if not done)
cd /path/to/Threadbox
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository, then:
git remote add origin https://github.com/YOUR_USERNAME/threadbox.git
git branch -M main
git push -u origin main
```

**See:** [Git Setup Guide](./git_setup.md) for detailed instructions

### 2. Google Cloud Setup (15 minutes)

```bash
# Install gcloud CLI (if not installed)
# https://cloud.google.com/sdk/docs/install

# Login and create project
gcloud auth login
gcloud projects create threadbox-production
gcloud config set project threadbox-production

# Enable APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  containerregistry.googleapis.com
```

### 3. Database Setup (10 minutes)

```bash
# Create Cloud SQL instance
gcloud sql instances create threadbox-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD

# Create database and user
gcloud sql connect threadbox-db --user=postgres
# Then in PostgreSQL:
CREATE DATABASE threadbox;
CREATE USER threadbox WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
```

### 4. CI/CD Setup (10 minutes)

#### Option A: GitHub Actions (Recommended)

1. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions"
   
   gcloud projects add-iam-policy-binding threadbox-production \
     --member="serviceAccount:github-actions@threadbox-production.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud iam service-accounts keys create github-actions-key.json \
     --iam-account=github-actions@threadbox-production.iam.gserviceaccount.com
   ```

2. **Add GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add all secrets from `.github/workflows/ci-cd.yml`

3. **Push code:**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

#### Option B: Cloud Build

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Connect GitHub repository
3. Use `cloudbuild.yaml` as config file
4. Set substitution variables

### 5. First Deployment

**Automatic (via CI/CD):**
- Push to `main` branch triggers automatic deployment

**Manual:**
```bash
# Build and push images
gcloud builds submit --config cloudbuild.yaml

# Or deploy directly
gcloud run deploy threadbox-backend --image gcr.io/threadbox-production/threadbox-backend:latest
```

## Required Secrets/Environment Variables

### GitHub Secrets (for GitHub Actions)
- `GCP_PROJECT_ID`
- `GCP_SA_KEY` (service account JSON)
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLAUDE_API_KEY`

### Cloud Build Substitutions (for Cloud Build)
- `_REGION`
- `_DATABASE_HOST`
- `_DATABASE_PORT`
- `_DATABASE_USER`
- `_DATABASE_PASSWORD`
- `_DATABASE_NAME`
- `_JWT_SECRET`
- `_JWT_EXPIRES_IN`
- `_CLAUDE_API_KEY`

## File Structure

```
Threadbox/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions workflow
├── cloudbuild.yaml            # Google Cloud Build config
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── Docs/
    ├── git_setup.md          # Git setup guide
    ├── gcp_deployment.md     # Full GCP deployment guide
    └── quick_start_deployment.md  # This file
```

## Common Commands

```bash
# View deployment status
gcloud run services list

# View logs
gcloud run services logs read threadbox-backend --region us-central1

# Get service URLs
gcloud run services describe threadbox-frontend --region us-central1 --format 'value(status.url)'

# Update environment variables
gcloud run services update threadbox-backend \
  --region us-central1 \
  --update-env-vars KEY=VALUE
```

## Next Steps

1. ✅ Set up Git repository
2. ✅ Create GCP project
3. ✅ Set up Cloud SQL database
4. ✅ Configure CI/CD
5. ✅ Deploy application
6. ⬜ Run database migrations
7. ⬜ Create super user
8. ⬜ Configure custom domain (optional)
9. ⬜ Set up monitoring

## Troubleshooting

**Build fails?**
- Check Cloud Build logs
- Verify Dockerfile paths
- Check environment variables

**Deployment fails?**
- Check Cloud Run logs
- Verify database connectivity
- Check service account permissions

**Database connection issues?**
- Verify Cloud SQL instance is running
- Check firewall rules
- Verify credentials

## Documentation

- **Full Git Guide:** [git_setup.md](./git_setup.md)
- **Full GCP Guide:** [gcp_deployment.md](./gcp_deployment.md)
- **Execution Steps:** [execution_steps.md](./execution_steps.md)

## Support

For detailed instructions, see:
- [Git Setup Guide](./git_setup.md)
- [GCP Deployment Guide](./gcp_deployment.md)

