# Threadbox

Email management and project collaboration platform.

## Project Status

✅ **All Stages Complete (1-14)**

The application is fully implemented with all core features:
- Authentication & User Management
- Project Management with RBAC
- Email Ingestion (Gmail, Outlook, IMAP)
- AI-Powered Spam Filtering & Project Routing (Grok)
- Email Processing Pipeline
- Incoming Mail Review
- Email Detail View & Internal Notes
- Assignment & Workflow Management
- Escalation System
- Notifications System
- Advanced Search & Filters
- Bulk Operations
- Testing Infrastructure
- Docker & CI/CD Setup

## Prerequisites

- Node.js 20+ LTS
- PostgreSQL 15+
- Docker & Docker Compose (for containerized deployment)
- npm or pnpm

## Quick Start with Docker

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Backend will be available at http://localhost:3001
# Frontend will be available at http://localhost:3000
# PostgreSQL will be available at localhost:5432
```

## Manual Setup

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb threadbox
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=threadbox

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

CLAUDE_API_KEY=your-claude-api-key
CLAUDE_API_URL=https://api.anthropic.com/v1
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Email Provider Configuration (Optional)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Threadbox
```

Start the frontend:

```bash
npm run dev
```

## Testing

### Backend Tests

```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## Deployment

### Using Docker

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

## CI/CD

The project includes GitHub Actions workflow for:
- Automated testing on push/PR
- Linting and code quality checks
- Docker image building

## Project Structure

```
threadbox/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend application
├── docker/            # Docker configuration files
├── .github/           # GitHub Actions workflows
├── Docs/              # Project documentation
│   └── execution_steps.md  # Detailed setup and deployment guide
└── PRD.md            # Product Requirements Document
```

## Quick Start Guides

- **Local Setup:** See [Execution Steps - Local Setup](./Docs/execution_steps.md#local-setup)
- **Google Cloud Deployment:** See [Execution Steps - GCP Setup](./Docs/execution_steps.md#google-cloud-platform-setup)

## Email Ingestion

Threadbox supports email ingestion from Gmail, Outlook, and IMAP providers. Emails are automatically:
- Classified for spam using AI (Grok)
- Routed to appropriate projects using AI
- Stored with full metadata and attachments

**Quick Start:**
1. See `/Docs/email_ingestion_setup.md` for detailed setup instructions
2. Use the API endpoint to trigger ingestion manually
3. Scheduled ingestion runs automatically every 15 minutes

**For detailed setup, see:** [Email Ingestion Setup Guide](/Docs/email_ingestion_setup.md)

## API Documentation

### Authentication
- `POST /auth/login` - Login with email and password

### Email Ingestion
- `POST /email-ingestion/ingest` - Manually trigger email ingestion (Super User only)
- `GET /email-ingestion/status` - Check ingestion service status

### Users (Super User only)
- `GET /users` - List all users
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Projects
- `GET /projects` - List all projects
- `GET /projects/:id` - Get project by ID
- `POST /projects` - Create project (Super User only)
- `PATCH /projects/:id` - Update project (Super User only)
- `DELETE /projects/:id` - Archive project (Super User only)

### Dashboard
- `GET /dashboard` - Get user's projects with statistics

### Emails
- `GET /emails` - List emails with filters
- `GET /emails/:id` - Get email by ID
- `PATCH /emails/bulk` - Bulk update emails

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/mark-all-read` - Mark all as read

### Assignments
- `PATCH /assignments/email/:id/assign` - Assign email to user/role
- `PATCH /assignments/email/:id/status` - Update email status

### Escalations
- `POST /escalations` - Create escalation
- `GET /escalations` - List escalations (Super User only)
- `PATCH /escalations/:id/review` - Review escalation (Super User only)

## Environment Variables

See `.env.example` files in backend and frontend directories for all required environment variables.

## License

UNLICENSED
