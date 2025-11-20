# Project Structure

## Root Directory

```
threadbox/
├── frontend/                 # Next.js frontend application
├── backend/                 # NestJS backend application
├── Docs/                    # Project documentation
├── docker/                  # Docker configuration files
├── .github/                 # GitHub Actions workflows
├── .gitignore
├── README.md
└── PRD.md                   # Product Requirements Document
```

## Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication routes group
│   │   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── (dashboard)/    # Protected routes group
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── [projectId]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── emails/
│   │   │   │   │       └── [emailId]/
│   │   │   │   │           └── page.tsx
│   │   │   ├── admin/       # Super User only
│   │   │   │   ├── incoming-review/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── roles/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── users/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/             # Next.js API routes (if needed)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home/redirect page
│   ├── components/          # React components
│   │   ├── common/          # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── ProjectCard.tsx
│   │   │   └── DashboardStats.tsx
│   │   ├── projects/        # Project view components
│   │   │   ├── ProjectHeader.tsx
│   │   │   ├── ProjectFilters.tsx
│   │   │   ├── ProjectTabs.tsx
│   │   │   ├── EmailsTimeline.tsx
│   │   │   ├── FilesLinksTimeline.tsx
│   │   │   └── EmailCard.tsx
│   │   ├── emails/          # Email detail components
│   │   │   ├── EmailDetail.tsx
│   │   │   ├── ClientConversation.tsx
│   │   │   ├── InternalNotes.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   ├── EmailActions.tsx
│   │   │   └── AssignmentPanel.tsx
│   │   ├── admin/           # Admin components
│   │   │   ├── IncomingMailReview.tsx
│   │   │   ├── ProjectManager.tsx
│   │   │   ├── RoleManager.tsx
│   │   │   └── UserManager.tsx
│   │   └── notifications/   # Notification components
│   │       └── NotificationCenter.tsx
│   ├── lib/                 # Utility libraries
│   │   ├── api/             # API client functions
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── emails.ts
│   │   │   ├── notes.ts
│   │   │   ├── assignments.ts
│   │   │   └── admin.ts
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── useEmails.ts
│   │   │   └── useNotifications.ts
│   │   ├── utils/           # Utility functions
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── permissions.ts
│   │   └── store/           # State management (Zustand/Context)
│   │       ├── authStore.ts
│   │       ├── projectStore.ts
│   │       └── notificationStore.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── email.ts
│   │   ├── role.ts
│   │   └── api.ts
│   └── styles/              # Global styles
│       └── globals.css
├── public/                  # Static assets
│   ├── images/
│   └── icons/
├── .env.local              # Local environment variables
├── .env.example            # Example environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
└── README.md
```

## Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── main.ts             # Application entry point
│   ├── app.module.ts       # Root application module
│   ├── config/             # Configuration files
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── email.config.ts
│   ├── modules/            # Feature modules
│   │   ├── auth/           # Authentication module
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── roles.guard.ts
│   │   ├── users/          # User management module
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── projects/       # Project management module
│   │   │   ├── projects.module.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── entities/
│   │   │   │   └── project.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-project.dto.ts
│   │   │       └── update-project.dto.ts
│   │   ├── roles/          # Role & permission module
│   │   │   ├── roles.module.ts
│   │   │   ├── roles.controller.ts
│   │   │   ├── roles.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── role.entity.ts
│   │   │   │   └── permission.entity.ts
│   │   │   └── dto/
│   │   │       └── create-role.dto.ts
│   │   ├── memberships/    # User-project membership module
│   │   │   ├── memberships.module.ts
│   │   │   ├── memberships.controller.ts
│   │   │   ├── memberships.service.ts
│   │   │   ├── entities/
│   │   │   │   └── membership.entity.ts
│   │   │   └── dto/
│   │   │       └── create-membership.dto.ts
│   │   ├── emails/         # Email management module
│   │   │   ├── emails.module.ts
│   │   │   ├── emails.controller.ts
│   │   │   ├── emails.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── email.entity.ts
│   │   │   │   ├── attachment.entity.ts
│   │   │   │   └── email-thread.entity.ts
│   │   │   └── dto/
│   │   │       ├── email-filter.dto.ts
│   │   │       └── update-email-status.dto.ts
│   │   ├── email-ingestion/ # Email ingestion module
│   │   │   ├── email-ingestion.module.ts
│   │   │   ├── email-ingestion.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── gmail.provider.ts
│   │   │   │   ├── outlook.provider.ts
│   │   │   │   └── imap.provider.ts
│   │   │   └── processors/
│   │   │       └── email-processor.service.ts
│   │   ├── ai/             # AI integration module
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.service.ts
│   │   │   ├── providers/
│   │   │   │   └── grok.provider.ts
│   │   │   └── services/
│   │   │       ├── spam-classifier.service.ts
│   │   │       └── project-classifier.service.ts
│   │   ├── notes/          # Internal notes module
│   │   │   ├── notes.module.ts
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   ├── entities/
│   │   │   │   └── note.entity.ts
│   │   │   └── dto/
│   │   │       └── create-note.dto.ts
│   │   ├── assignments/    # Assignment & workflow module
│   │   │   ├── assignments.module.ts
│   │   │   ├── assignments.controller.ts
│   │   │   ├── assignments.service.ts
│   │   │   ├── entities/
│   │   │   │   └── assignment.entity.ts
│   │   │   └── dto/
│   │   │       └── create-assignment.dto.ts
│   │   ├── escalations/    # Escalation module
│   │   │   ├── escalations.module.ts
│   │   │   ├── escalations.controller.ts
│   │   │   ├── escalations.service.ts
│   │   │   ├── entities/
│   │   │   │   └── escalation.entity.ts
│   │   │   └── dto/
│   │   │       └── create-escalation.dto.ts
│   │   ├── notifications/  # Notifications module
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── entities/
│   │   │   │   └── notification.entity.ts
│   │   │   └── gateways/
│   │   │       └── notifications.gateway.ts  # WebSocket gateway
│   │   └── incoming-review/ # Incoming mail review module
│   │       ├── incoming-review.module.ts
│   │       ├── incoming-review.controller.ts
│   │       └── incoming-review.service.ts
│   ├── common/             # Shared utilities and decorators
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── logger.util.ts
│   │       └── response.util.ts
│   └── database/            # Database configuration
│       ├── migrations/     # Database migrations
│       └── seeds/          # Database seed files
├── test/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── nest-cli.json           # NestJS CLI configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
└── README.md
```

## Documentation Structure (`/Docs`)

```
Docs/
├── Implementation.md       # Implementation plan with stages and tasks
├── project_structure.md    # This file - project structure documentation
├── UI_UX_doc.md           # UI/UX design specifications
└── Bug_tracking.md        # Bug tracking and resolution log
```

## Docker Structure (`/docker`)

```
docker/
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile.frontend     # Frontend Dockerfile
├── Dockerfile.backend      # Backend Dockerfile
└── nginx.conf              # Nginx configuration (if needed)
```

## Configuration Files

### Frontend Configuration
- `next.config.js` - Next.js configuration (API routes, image optimization, etc.)
- `tailwind.config.js` - Tailwind CSS configuration (theme, plugins)
- `tsconfig.json` - TypeScript compiler options
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules

### Backend Configuration
- `nest-cli.json` - NestJS CLI configuration
- `tsconfig.json` - TypeScript compiler options
- `ormconfig.ts` or `prisma/schema.prisma` - Database ORM configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules

### Environment Variables

#### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Threadbox
```

#### Backend (`.env`)
```
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=threadbox
DATABASE_PASSWORD=password
DATABASE_NAME=threadbox

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Claude AI API
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_API_URL=https://api.anthropic.com/v1
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Email Providers
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
OUTLOOK_CLIENT_ID=your-outlook-client-id
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret

# Application
PORT=3001
NODE_ENV=development
```

## File Naming Conventions

### Frontend
- **Components:** PascalCase (e.g., `EmailCard.tsx`, `ProjectHeader.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`, `useProjects.ts`)
- **Utilities:** camelCase (e.g., `format.ts`, `validation.ts`)
- **Types:** camelCase (e.g., `user.ts`, `email.ts`)
- **Pages:** Next.js App Router conventions (lowercase folders, `page.tsx` files)

### Backend
- **Modules:** kebab-case (e.g., `email-ingestion.module.ts`)
- **Controllers:** kebab-case with `.controller.ts` suffix
- **Services:** kebab-case with `.service.ts` suffix
- **Entities:** kebab-case with `.entity.ts` suffix
- **DTOs:** kebab-case with `.dto.ts` suffix
- **Guards:** kebab-case with `.guard.ts` suffix
- **Strategies:** kebab-case with `.strategy.ts` suffix

## Module Organization Principles

1. **Feature-based modules:** Each major feature (users, projects, emails) has its own module
2. **Separation of concerns:** Controllers handle HTTP, services handle business logic, entities handle data
3. **Shared utilities:** Common functionality goes in `/common` directory
4. **Type safety:** Use TypeScript interfaces and DTOs for all data structures
5. **Dependency injection:** Use NestJS dependency injection for all services

## Database Organization

- **Migrations:** All schema changes go through migrations
- **Seeds:** Initial data (roles, permissions) goes in seed files
- **Indexes:** Add indexes for frequently queried fields (email sender, project_id, user_id)
- **Relations:** Use proper foreign keys and relationships in the ORM

## Asset Organization

- **Images:** Store in `/frontend/public/images/`
- **Icons:** Store in `/frontend/public/icons/` or use an icon library
- **Fonts:** Store in `/frontend/public/fonts/` or use a CDN
- **Email Attachments:** Store in backend storage (local filesystem or cloud storage like S3)

## Build and Deployment Structure

### Development
- Frontend: `npm run dev` (runs on port 3000)
- Backend: `npm run start:dev` (runs on port 3001)

### Production
- Frontend: Builds to `.next` directory, served via Next.js server or static export
- Backend: Builds to `dist` directory, runs via Node.js
- Database: PostgreSQL running in separate container or managed service

## Testing Structure

- **Unit tests:** Co-located with source files (`.spec.ts` or `.test.ts`)
- **Integration tests:** In `/test/integration/` directory
- **E2E tests:** In `/test/e2e/` directory
- **Test utilities:** Shared test helpers in `/test/utils/`

## Git Structure

- **Main branch:** `main` or `master` (production-ready code)
- **Development branch:** `develop` (integration branch)
- **Feature branches:** `feature/feature-name` (individual features)
- **Release branches:** `release/version-number` (preparing releases)
- **Hotfix branches:** `hotfix/issue-description` (urgent fixes)

## Notes

- All paths are relative to the project root unless specified otherwise
- Use absolute imports in TypeScript (configured via `tsconfig.json` paths)
- Follow the established naming conventions consistently
- Keep modules focused and avoid circular dependencies
- Document complex business logic and algorithms

