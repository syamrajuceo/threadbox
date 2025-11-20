# Execution Steps - Threadbox Application

This document provides detailed step-by-step instructions for setting up and running the Threadbox application both locally and on Google Cloud Platform.

## Table of Contents

1. [Local Setup](#local-setup)
2. [Google Cloud Platform Setup](#google-cloud-platform-setup)
3. [Troubleshooting](#troubleshooting)

---

## Local Setup

### Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js** 20.x LTS or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **npm** or **pnpm** (comes with Node.js)
- **Docker** and **Docker Compose** (optional, for containerized setup) ([Download](https://www.docker.com/products/docker-desktop))

### Step 1: Clone the Repository

```bash
# Clone the repository
# Replace <repository-url> with your actual repository URL
# Examples:
#   GitHub: git clone https://github.com/your-username/Threadbox.git
#   GitLab: git clone https://gitlab.com/your-username/Threadbox.git
#   Bitbucket: git clone https://bitbucket.org/your-username/Threadbox.git
#   Or if you have SSH keys set up:
#   GitHub: git clone git@github.com:your-username/Threadbox.git

git clone <repository-url>
cd Threadbox
```

**Note:** If you don't have a remote repository yet, you can initialize a local git repository:
```bash
# Initialize git repository (if starting fresh)
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Set Up PostgreSQL Database

#### Option A: Using Local PostgreSQL Installation

1. **Start PostgreSQL service:**
   ```bash
   # On macOS (using Homebrew)
   brew services start postgresql@15
   
   # On Linux
   sudo systemctl start postgresql
   
   # On Windows
   # Start PostgreSQL service from Services panel
   ```

2. **Create the database:**
   ```bash
   # Connect to PostgreSQL
   # On macOS with Homebrew, use your current username instead of "postgres"
   # Replace "your_username" with your actual macOS username (run "whoami" to find it)
   psql -U your_username -d postgres
   
   # Or if you have a default database, just:
   psql
   
   # Create database and user
   CREATE DATABASE threadbox;
   CREATE USER threadbox WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
   \q
   ```
   
   **Note for macOS Homebrew users:** The default PostgreSQL superuser is your current macOS username, not "postgres". If you get "role does not exist" error, use:
   ```bash
   psql -U $(whoami) -d postgres
   # Or simply:
   psql
   ```

#### Option B: Using Docker (Recommended for Quick Setup)

```bash
# Start PostgreSQL container
docker run --name threadbox-postgres \
  -e POSTGRES_USER=threadbox \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=threadbox \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify it's running
docker ps
```

### Step 3: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy example file (if it exists)
   cp .env.example .env
   
   # If .env.example doesn't exist, create .env manually with the content below
   ```
   
   **Note:** If you get "No such file or directory" error, the `.env.example` file may not exist yet. You can create the `.env` file manually with the configuration shown in Step 4.

4. **Configure environment variables:**
   
   Edit `backend/.env` with the following content:
   ```env
   # Database Configuration
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=threadbox
   DATABASE_PASSWORD=your_secure_password
   DATABASE_NAME=threadbox
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   
   # Claude AI API (Optional - for AI features)
   CLAUDE_API_KEY=your-claude-api-key-here
   CLAUDE_API_URL=https://api.anthropic.com/v1
   CLAUDE_MODEL=claude-3-5-sonnet-20241022
   
   # Email Providers (Optional - configure as needed)
   GMAIL_CLIENT_ID=your-gmail-client-id
   GMAIL_CLIENT_SECRET=your-gmail-client-secret
   OUTLOOK_CLIENT_ID=your-outlook-client-id
   OUTLOOK_CLIENT_SECRET=your-outlook-client-secret
   
   # Application Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. **Generate JWT Secret (if needed):**
   ```bash
   # Generate a secure random string
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Start the backend:**
   ```bash
   # Development mode (with hot reload)
   npm run start:dev
   
   # The backend will start on http://localhost:3001
   ```

7. **Verify backend is running:**
   - Open browser: http://localhost:3001
   - You should see a response or API documentation

### Step 4: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env.local file
   ```

4. **Configure environment variables:**
   
   Edit `frontend/.env.local` with the following content:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_NAME=Threadbox
   ```

5. **Start the frontend:**
   ```bash
   # Development mode
   npm run dev
   
   # The frontend will start on http://localhost:3000
   ```

6. **Verify frontend is running:**
   - Open browser: http://localhost:3000
   - You should see the login page

### Step 5: Create Initial Super User

Since the application requires authentication, you need to create a Super User account. You have two options:

#### Option A: Using API (Temporary Auth Bypass)

1. **Temporarily disable auth guard** (for initial setup only):
   - Comment out `@UseGuards(JwtAuthGuard)` in `backend/src/modules/users/users.controller.ts`
   - Create user via API
   - Re-enable auth guard

2. **Create user via curl:**
   ```bash
   curl -X POST http://localhost:3001/users \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@threadbox.com",
       "password": "SecurePassword123!",
       "firstName": "Admin",
       "lastName": "User",
       "globalRole": "super_user",
       "status": "active"
     }'
   ```

#### Option B: Using Database Seed Script

1. **Create a seed script** `backend/src/database/seeds/create-super-user.ts`:
   ```typescript
   import { DataSource } from 'typeorm';
   import * as bcrypt from 'bcrypt';
   import { User, GlobalRole, UserStatus } from '../modules/users/entities/user.entity';

   export async function createSuperUser(dataSource: DataSource) {
     const userRepository = dataSource.getRepository(User);
     
     const hashedPassword = await bcrypt.hash('SecurePassword123!', 10);
     
     const superUser = userRepository.create({
       email: 'admin@threadbox.com',
       password: hashedPassword,
       firstName: 'Admin',
       lastName: 'User',
       globalRole: GlobalRole.SUPER_USER,
       status: UserStatus.ACTIVE,
     });
     
     await userRepository.save(superUser);
     console.log('Super User created successfully!');
   }
   ```

2. **Run the seed script:**
   ```bash
   npm run seed
   ```

### Step 6: Verify Installation

1. **Access the application:**
   - Open browser: http://localhost:3000
   - Login with the Super User credentials created in Step 5

2. **Test basic functionality:**
   - Create a project
   - Create a user
   - Create a role
   - Assign user to project

### Step 7: Using Docker Compose (Alternative)

If you prefer using Docker for the entire stack:

1. **Navigate to project root:**
   ```bash
   cd /path/to/Threadbox
   ```

2. **Create environment files:**
   - Copy `backend/.env.example` to `backend/.env` and configure
   - Copy `frontend/.env.example` to `frontend/.env.local` and configure

3. **Start all services:**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. **View logs:**
   ```bash
   docker-compose -f docker/docker-compose.yml logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose -f docker/docker-compose.yml down
   ```

---

## Google Cloud Platform Setup

### Prerequisites

- **Google Cloud Account** with billing enabled
- **Google Cloud SDK (gcloud)** installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
- **Docker** installed locally
- **Domain name** (optional, for production)

### Step 1: Set Up Google Cloud Project

1. **Create a new project:**
   ```bash
   gcloud projects create threadbox-production --name="Threadbox Production"
   gcloud config set project threadbox-production
   ```

2. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable sqladmin.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Set up billing:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to Billing
   - Link a billing account to your project

### Step 2: Set Up Cloud SQL (PostgreSQL)

1. **Create Cloud SQL instance:**
   ```bash
   gcloud sql instances create threadbox-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1 \
     --root-password=your-secure-root-password
   ```

2. **Create database:**
   ```bash
   gcloud sql databases create threadbox --instance=threadbox-db
   ```

3. **Create database user:**
   ```bash
   gcloud sql users create threadbox \
     --instance=threadbox-db \
     --password=your-secure-password
   ```

4. **Get connection name:**
   ```bash
   gcloud sql instances describe threadbox-db --format="value(connectionName)"
   # Save this connection name for later use
   ```

### Step 3: Set Up Google Cloud Secrets

1. **Store secrets in Secret Manager:**
   ```bash
   # JWT Secret
   echo -n "your-super-secret-jwt-key" | gcloud secrets create jwt-secret --data-file=-
   
   # Database Password
   echo -n "your-secure-password" | gcloud secrets create db-password --data-file=-
   
   # Grok API Key
   echo -n "your-grok-api-key" | gcloud secrets create grok-api-key --data-file=-
   
   # Gmail Client Secret
   echo -n "your-gmail-client-secret" | gcloud secrets create gmail-client-secret --data-file=-
   ```

2. **Grant access to Cloud Run service account:**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"
   
   gcloud secrets add-iam-policy-binding jwt-secret \
     --member="serviceAccount:${SERVICE_ACCOUNT}" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding db-password \
     --member="serviceAccount:${SERVICE_ACCOUNT}" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding grok-api-key \
     --member="serviceAccount:${SERVICE_ACCOUNT}" \
     --role="roles/secretmanager.secretAccessor"
   ```

### Step 4: Build and Push Docker Images

1. **Configure Docker for GCR:**
   ```bash
   gcloud auth configure-docker
   ```

2. **Build and push backend image:**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   
   # Build backend image
   docker build -f docker/Dockerfile.backend -t gcr.io/${PROJECT_ID}/threadbox-backend:latest ./backend
   
   # Push to Google Container Registry
   docker push gcr.io/${PROJECT_ID}/threadbox-backend:latest
   ```

3. **Build and push frontend image:**
   ```bash
   # Build frontend image
   docker build -f docker/Dockerfile.frontend -t gcr.io/${PROJECT_ID}/threadbox-frontend:latest ./frontend
   
   # Push to Google Container Registry
   docker push gcr.io/${PROJECT_ID}/threadbox-frontend:latest
   ```

### Step 5: Deploy Backend to Cloud Run

1. **Create Cloud Run service for backend:**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   CONNECTION_NAME=$(gcloud sql instances describe threadbox-db --format="value(connectionName)")
   
   gcloud run deploy threadbox-backend \
     --image gcr.io/${PROJECT_ID}/threadbox-backend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --add-cloudsql-instances ${CONNECTION_NAME} \
     --set-env-vars "DATABASE_HOST=/cloudsql/${CONNECTION_NAME}" \
     --set-env-vars "DATABASE_PORT=5432" \
     --set-env-vars "DATABASE_USER=threadbox" \
     --set-env-vars "DATABASE_NAME=threadbox" \
     --set-env-vars "NODE_ENV=production" \
     --set-env-vars "PORT=8080" \
     --set-secrets "DATABASE_PASSWORD=db-password:latest" \
     --set-secrets "JWT_SECRET=jwt-secret:latest" \
     --set-secrets "GROK_API_KEY=grok-api-key:latest" \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10
   ```

2. **Get backend URL:**
   ```bash
   BACKEND_URL=$(gcloud run services describe threadbox-backend \
     --platform managed \
     --region us-central1 \
     --format 'value(status.url)')
   
   echo "Backend URL: ${BACKEND_URL}"
   ```

### Step 6: Deploy Frontend to Cloud Run

1. **Update frontend environment:**
   - Update `frontend/.env.production` with the backend URL:
   ```env
   NEXT_PUBLIC_API_URL=${BACKEND_URL}
   NEXT_PUBLIC_APP_NAME=Threadbox
   ```

2. **Rebuild frontend with production environment:**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   
   # Rebuild with production env
   docker build -f docker/Dockerfile.frontend \
     --build-arg NEXT_PUBLIC_API_URL=${BACKEND_URL} \
     -t gcr.io/${PROJECT_ID}/threadbox-frontend:latest ./frontend
   
   # Push updated image
   docker push gcr.io/${PROJECT_ID}/threadbox-frontend:latest
   ```

3. **Deploy frontend:**
   ```bash
   gcloud run deploy threadbox-frontend \
     --image gcr.io/${PROJECT_ID}/threadbox-frontend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10
   ```

4. **Get frontend URL:**
   ```bash
   FRONTEND_URL=$(gcloud run services describe threadbox-frontend \
     --platform managed \
     --region us-central1 \
     --format 'value(status.url)')
   
   echo "Frontend URL: ${FRONTEND_URL}"
   ```

### Step 7: Set Up Custom Domain (Optional)

1. **Map custom domain to Cloud Run:**
   ```bash
   # Backend
   gcloud run domain-mappings create \
     --service threadbox-backend \
     --domain api.yourdomain.com \
     --region us-central1
   
   # Frontend
   gcloud run domain-mappings create \
     --service threadbox-frontend \
     --domain yourdomain.com \
     --region us-central1
   ```

2. **Update DNS records:**
   - Add CNAME records as instructed by Google Cloud
   - Wait for DNS propagation (can take up to 48 hours)

### Step 8: Set Up Cloud Storage for Attachments

1. **Create Cloud Storage bucket:**
   ```bash
   PROJECT_ID=$(gcloud config get-value project)
   
   gsutil mb -p ${PROJECT_ID} -c STANDARD -l us-central1 gs://${PROJECT_ID}-threadbox-attachments
   ```

2. **Update backend to use Cloud Storage:**
   - Modify `backend/src/modules/email-ingestion/email-ingestion.service.ts`
   - Use `@google-cloud/storage` package instead of local file system
   - Update attachment storage logic

### Step 9: Set Up Monitoring and Logging

1. **Enable Cloud Monitoring:**
   ```bash
   gcloud services enable monitoring.googleapis.com
   gcloud services enable logging.googleapis.com
   ```

2. **View logs:**
   ```bash
   # Backend logs
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=threadbox-backend" --limit 50
   
   # Frontend logs
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=threadbox-frontend" --limit 50
   ```

3. **Set up alerts:**
   - Go to [Cloud Console > Monitoring > Alerting](https://console.cloud.google.com/monitoring/alerting)
   - Create alert policies for:
     - High error rates
     - High latency
     - Service unavailability

### Step 10: Set Up CI/CD Pipeline

1. **Create Cloud Build trigger:**
   ```bash
   gcloud builds triggers create github \
     --name="threadbox-ci-cd" \
     --repo-name="your-repo-name" \
     --repo-owner="your-github-username" \
     --branch-pattern="^main$" \
     --build-config=".github/workflows/ci.yml" \
     --region=us-central1
   ```

2. **Update GitHub Actions workflow:**
   - Modify `.github/workflows/ci.yml` to include GCP deployment steps
   - Add GCP service account key as GitHub secret

### Step 11: Create Initial Super User

1. **Connect to Cloud SQL:**
   ```bash
   gcloud sql connect threadbox-db --user=threadbox
   ```

2. **Create Super User via SQL:**
   ```sql
   -- Note: You'll need to hash the password using bcrypt
   -- Use a script or the backend API to create the user
   ```

3. **Or use the backend API:**
   ```bash
   # Temporarily allow unauthenticated access to /users endpoint
   # Create user via API
   curl -X POST ${BACKEND_URL}/users \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@threadbox.com",
       "password": "SecurePassword123!",
       "firstName": "Admin",
       "lastName": "User",
       "globalRole": "super_user",
       "status": "active"
     }'
   ```

### Step 12: Verify Deployment

1. **Test backend:**
   ```bash
   curl ${BACKEND_URL}/health
   ```

2. **Test frontend:**
   - Open browser: ${FRONTEND_URL}
   - Verify login page loads

3. **Test authentication:**
   - Login with Super User credentials
   - Verify dashboard loads

---

## Troubleshooting

### Local Setup Issues

#### Database Connection Errors

**Problem:** Cannot connect to PostgreSQL - "Unable to connect to the database"

**Solutions:**

1. **Verify PostgreSQL is running:**
   ```bash
   # macOS/Linux
   ps aux | grep postgres
   
   # Check if port 5432 is in use
   lsof -i :5432
   
   # Start PostgreSQL if not running (macOS Homebrew)
   brew services start postgresql@15
   ```

2. **Check if database and user exist:**
   ```bash
   # Connect as superuser (macOS: use your username, Linux: use postgres)
   psql -U syamraju -d postgres
   
   # List databases
   \l
   
   # List users
   \du
   
   # Check if threadbox database exists
   \q
   ```

3. **Verify database credentials in `.env`:**
   ```bash
   cd backend
   cat .env | grep DATABASE
   ```

4. **Test connection manually:**
   ```bash
   # Test with threadbox user
   psql -U threadbox -d threadbox -c "SELECT 1;"
   
   # If this fails, the password might be wrong
   ```

5. **Fix password mismatch:**
   
   If the password in `.env` doesn't match, update it:
   ```bash
   # Connect as superuser
   psql -U syamraju -d postgres
   
   # Reset password for threadbox user
   ALTER USER threadbox WITH PASSWORD 'your_secure_password';
   \q
   ```
   
   Then update `backend/.env`:
   ```env
   DATABASE_PASSWORD=your_secure_password
   ```

6. **Fix "permission denied for schema public" error:**
   
   If you see "permission denied for schema public" when TypeORM tries to create tables:
   ```bash
   # Connect as superuser
   psql -U syamraju -d threadbox
   
   # Grant necessary permissions
   GRANT ALL ON SCHEMA public TO threadbox;
   GRANT CREATE ON SCHEMA public TO threadbox;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO threadbox;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO threadbox;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TYPES TO threadbox;
   \q
   ```
   
   This allows the threadbox user to create tables, sequences, and enum types in the public schema.

7. **Alternative: Use your macOS username (if threadbox user has issues):**
   
   Update `backend/.env`:
   ```env
   DATABASE_USER=syamraju
   DATABASE_PASSWORD=  # Leave empty if using peer authentication
   ```
   
   **Note:** On macOS with Homebrew, you can often connect without a password using peer authentication.

8. **Verify database exists:**
   ```bash
   psql -U syamraju -d postgres -c "\l" | grep threadbox
   ```
   
   If database doesn't exist, create it:
   ```bash
   psql -U syamraju -d postgres
   CREATE DATABASE threadbox;
   GRANT ALL PRIVILEGES ON DATABASE threadbox TO threadbox;
   \q
   ```

#### Port Already in Use

**Problem:** Port 3000 or 3001 already in use - "Error: listen EADDRINUSE: address already in use"

**Solutions:**
1. **Find and kill the process using the port:**
   ```bash
   # Find process ID
   lsof -ti:3001  # Backend port
   lsof -ti:3000  # Frontend port
   
   # Kill the process
   kill -9 $(lsof -ti:3001)  # Kill backend
   kill -9 $(lsof -ti:3000)  # Kill frontend
   
   # Or find and kill manually
   lsof -i :3001  # Shows process details
   kill -9 <PID>  # Replace <PID> with the process ID
   ```

2. **Alternative: Use a different port:**
   - Backend: Update `PORT=3002` in `backend/.env`
   - Frontend: Update `NEXT_PUBLIC_API_URL=http://localhost:3002` in `frontend/.env.local`

#### Module Not Found Errors

**Problem:** `Cannot find module` errors

**Solutions:**
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### Google Cloud Setup Issues

#### Cloud SQL Connection Issues

**Problem:** Cannot connect to Cloud SQL from Cloud Run

**Solutions:**
1. Verify Cloud SQL instance is running
2. Check connection name is correct
3. Verify Cloud Run service has Cloud SQL connection enabled
4. Check IAM permissions

#### Secret Manager Access Denied

**Problem:** Cannot access secrets from Cloud Run

**Solutions:**
1. Verify service account has Secret Manager access:
   ```bash
   gcloud projects get-iam-policy ${PROJECT_ID} \
     --flatten="bindings[].members" \
     --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT}"
   ```

2. Grant necessary permissions:
   ```bash
   gcloud projects add-iam-policy-binding ${PROJECT_ID} \
     --member="serviceAccount:${SERVICE_ACCOUNT}" \
     --role="roles/secretmanager.secretAccessor"
   ```

#### Image Build Failures

**Problem:** Docker build fails

**Solutions:**
1. Check Dockerfile syntax
2. Verify all dependencies are in package.json
3. Check build logs:
   ```bash
   gcloud builds log <BUILD_ID>
   ```

#### High Costs

**Problem:** Unexpected charges

**Solutions:**
1. Set up billing alerts in Cloud Console
2. Use smaller instance sizes for development
3. Set min-instances to 0 for Cloud Run (scales to zero)
4. Use Cloud SQL with smaller tier for development

### General Issues

#### CORS Errors

**Problem:** Frontend cannot connect to backend

**Solutions:**
1. Verify `FRONTEND_URL` in backend `.env` matches frontend URL
2. Check CORS configuration in `backend/src/main.ts`
3. Verify API URL in frontend `.env.local`

#### Authentication Issues

**Problem:** Cannot login or JWT errors

**Solutions:**
1. Verify JWT_SECRET is set correctly
2. Check token expiration settings
3. Clear browser localStorage and cookies
4. Verify user exists in database

#### Email Ingestion Not Working

**Problem:** Emails not being ingested

**Solutions:**
1. **Verify email provider credentials:**
   - Check `.env` file has correct credentials
   - For Gmail: Verify client ID, secret, and refresh token
   - For Outlook: Verify client ID, secret, and access token
   - For IMAP: Verify host, port, username, and password

2. **Test manual ingestion:**
   ```bash
   # Get JWT token first (login)
   TOKEN=$(curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@threadbox.com","password":"SecurePassword123!"}' \
     | jq -r '.access_token')
   
   # Trigger ingestion
   curl -X POST http://localhost:3001/email-ingestion/ingest \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "provider": "imap",
       "account": "your-email@example.com",
       "credentials": {
         "username": "your-email@example.com",
         "password": "your-password",
         "host": "imap.example.com",
         "port": "993",
         "tls": true
       }
     }'
   ```

3. **Check email provider API quotas:**
   - Gmail: 1 billion quota units per day
   - Outlook: Check Azure AD limits
   - IMAP: Usually no limits

4. **Review email ingestion service logs:**
   - Check backend console for error messages
   - Look for authentication errors
   - Verify database connection

5. **Verify email provider permissions/scope:**
   - Gmail: Needs `gmail.readonly` scope
   - Outlook: Needs `Mail.Read` permission
   - IMAP: Needs read access to mailbox

6. **Check scheduled ingestion:**
   - Scheduler runs every 15 minutes automatically
   - Configure accounts in `.env` as `GMAIL_ACCOUNTS` JSON
   - Check scheduler logs in backend console

**For detailed setup instructions, see:** `/Docs/email_ingestion_setup.md`

---

## Additional Resources

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NestJS Deployment Guide](https://docs.nestjs.com/recipes/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Consult the main README.md
4. Check the Implementation.md for feature details

---

**Last Updated:** $(date)
**Version:** 1.0.0

