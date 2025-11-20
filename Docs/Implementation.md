# Implementation Plan for THREADBOX

## Feature Analysis

### Identified Features:

1. **Authentication & User Management**
   - Email/password login (with future SSO support)
   - User status management (Active/Inactive)
   - Super User user management capabilities

2. **Project Management**
   - Create/edit/archive projects with detailed descriptions
   - Client name/identifier tracking
   - Project metadata (domains, keywords, known addresses)

3. **Role-Based Access Control (RBAC)**
   - Global roles (Super User)
   - Project roles (Project Manager, Developer, Tester, custom roles)
   - Granular permissions per role (view scope, assignment, member management, email sending, status changes)
   - User-project membership with role assignment

4. **Email Ingestion**
   - Multi-provider email integration (Gmail, Outlook, IMAP/SMTP)
   - Email storage with full metadata (sender, recipients, subject, body, attachments, timestamps)
   - Email status tracking (Open, In Progress, Waiting, Closed)

5. **AI-Powered Spam Filtering (Grok)**
   - Automatic spam classification with confidence scores
   - High-confidence spam isolation
   - Possible spam flagging for review

6. **AI-Powered Project Routing (Grok)**
   - Automatic project classification using email content and project descriptions
   - Confidence-based auto-assignment
   - Fallback to unassigned for low-confidence or unavailable AI

7. **Incoming Mail Review (Super User)**
   - Dedicated review screen for unassigned emails
   - Spam review and correction
   - Manual project/user/role assignment
   - AI suggestion review and override

8. **Dashboard**
   - Project listing based on user membership
   - Project cards with stats (open emails, last updated)
   - Role-based dashboard content
   - Admin area access for Super User

9. **Project View & Timeline**
   - Unified UI layout across all roles
   - Emails Timeline (chronological email events)
   - Files & Links Timeline (attachments and extracted links)
   - Role-based content filtering

10. **Email Detail View**
    - Client Conversation thread view
    - Internal Notes section (separate from client communication)
    - Role-based action buttons (reply, forward, assign, status change)

11. **Internal Notes & Mentions**
    - Internal-only comments on emails
    - @mention support for project members
    - In-app notifications for mentions

12. **Assignment & Workflow**
    - Email assignment to users or roles
    - Status lifecycle management
    - Role-based status transition permissions

13. **Escalation System**
    - PM escalation to Super User
    - Escalation messages/justifications
    - Super User approval/rejection workflow

14. **Search & Filters**
    - Email search by subject, sender, tags, status, date range
    - Role-based access enforcement in search results

15. **Notifications**
    - In-app notifications for assignments, mentions, escalations
    - Notification read/unread status

### Feature Categorization:

- **Must-Have Features:**
  - Authentication & User Management
  - Project Management
  - Role-Based Access Control
  - Email Ingestion
  - AI-Powered Spam Filtering (Grok)
  - AI-Powered Project Routing (Grok)
  - Incoming Mail Review (Super User)
  - Dashboard
  - Project View & Timeline
  - Email Detail View
  - Role-Based Timeline Visibility
  - Internal Notes & Mentions
  - Assignment & Workflow

- **Should-Have Features:**
  - Escalation System
  - Search & Filters
  - Notifications
  - Files & Links Timeline

- **Nice-to-Have Features:**
  - SSO authentication
  - Advanced analytics and reporting
  - Email templates
  - Bulk operations

## Recommended Tech Stack

### Frontend:
- **Framework:** Next.js 14 (App Router) with TypeScript - Provides server-side rendering, API routes, and excellent TypeScript support for type-safe development
- **Documentation:** https://nextjs.org/docs
- **UI Library:** React 18+ - Modern React with hooks and concurrent features
- **Documentation:** https://react.dev
- **Styling:** Tailwind CSS - Utility-first CSS framework for rapid UI development
- **Documentation:** https://tailwindcss.com/docs
- **State Management:** Zustand or React Context - Lightweight state management for client-side state
- **Documentation:** https://zustand-demo.pmnd.rs
- **Form Handling:** React Hook Form - Performant form library with validation
- **Documentation:** https://react-hook-form.com
- **HTTP Client:** Axios or Fetch API - For API communication
- **Documentation:** https://axios-http.com

### Backend:
- **Framework:** NestJS with TypeScript - Enterprise-grade Node.js framework with built-in support for TypeScript, dependency injection, and modular architecture
- **Documentation:** https://docs.nestjs.com
- **Runtime:** Node.js 20+ LTS - Latest stable Node.js version
- **Documentation:** https://nodejs.org/docs
- **API Style:** RESTful API - Standard REST endpoints for all operations
- **Authentication:** Passport.js with JWT - Secure authentication with JSON Web Tokens
- **Documentation:** https://www.passportjs.org
- **Validation:** class-validator & class-transformer - Decorator-based validation
- **Documentation:** https://github.com/typestack/class-validator

### Database:
- **Database:** PostgreSQL 15+ - Robust relational database with excellent JSON support and full-text search capabilities
- **Documentation:** https://www.postgresql.org/docs
- **ORM:** TypeORM or Prisma - Type-safe database access and migrations
- **Documentation:** https://typeorm.io or https://www.prisma.io/docs
- **Migrations:** Database migration system via ORM

### Email Integration:
- **Gmail API:** Google Gmail API - For Gmail/Google Workspace integration
- **Documentation:** https://developers.google.com/gmail/api
- **Microsoft Graph API:** Microsoft Graph API - For Outlook/Microsoft 365 integration
- **Documentation:** https://learn.microsoft.com/en-us/graph/overview
- **IMAP/SMTP:** node-imap & nodemailer - For generic IMAP/SMTP email providers
- **Documentation:** https://github.com/mscdex/node-imap, https://nodemailer.com

### AI Integration:
- **LLM Provider:** Grok (xAI) - External LLM for spam classification and project routing
- **Documentation:** https://x.ai (official xAI documentation)
- **API Client:** Custom service layer - Encapsulated AI service for easy provider switching

### Additional Tools:
- **Version Control:** Git - Source code management
- **Documentation:** https://git-scm.com/doc
- **Package Manager:** npm or pnpm - Dependency management
- **Documentation:** https://docs.npmjs.com
- **Testing:**
  - **Frontend:** Jest + React Testing Library
  - **Documentation:** https://jestjs.io, https://testing-library.com/react
  - **Backend:** Jest + Supertest
  - **Documentation:** https://jestjs.io, https://github.com/visionmedia/supertest
- **Code Quality:**
  - **Linting:** ESLint
  - **Documentation:** https://eslint.org
  - **Formatting:** Prettier
  - **Documentation:** https://prettier.io
- **Deployment:**
  - **Containerization:** Docker
  - **Documentation:** https://docs.docker.com
  - **Hosting:** AWS/GCP/Azure (containers or serverless)
- **Monitoring:**
  - **Logging:** Winston or Pino
  - **Documentation:** https://github.com/winstonjs/winston
  - **Error Tracking:** Sentry (optional)
  - **Documentation:** https://docs.sentry.io

## Implementation Stages

### Stage 1: Foundation & Setup
**Duration:** 1-2 days
**Dependencies:** None

#### Sub-steps:
- [ ] Set up development environment (Node.js, PostgreSQL, Git)
- [ ] Initialize Next.js project with TypeScript
- [ ] Initialize NestJS backend project with TypeScript
- [ ] Configure project structure and folder organization
- [ ] Set up PostgreSQL database and connection
- [ ] Configure environment variables and secrets management
- [ ] Set up ORM (TypeORM or Prisma) and database migrations
- [ ] Create basic authentication system (login, JWT tokens)
- [ ] Set up basic user model and authentication endpoints
- [ ] Configure CORS and security middleware
- [ ] Set up ESLint, Prettier, and code quality tools
- [ ] Initialize Git repository and create initial commit
- [ ] Set up Docker for local development (optional)

### Stage 2: Core Data Models & Authentication
**Duration:** 2-3 days
**Dependencies:** Stage 1 completion

#### Sub-steps:
- [ ] Design and implement database schema (Users, Projects, Roles, Permissions, Emails, Notes, Assignments)
- [ ] Create database migrations for all core tables
- [ ] Implement User model with authentication logic
- [ ] Implement Project model with CRUD operations
- [ ] Implement Role model with permission definitions
- [ ] Implement User-Project membership model
- [ ] Create authentication middleware and guards
- [ ] Implement role-based access control (RBAC) middleware
- [ ] Create API endpoints for user management (Super User only)
- [ ] Create API endpoints for project CRUD operations
- [ ] Create API endpoints for role management
- [ ] Create API endpoints for user-project membership
- [ ] Implement frontend authentication pages (login, logout)
- [ ] Implement frontend authentication state management
- [ ] Create protected route components for frontend
- [ ] Test authentication flow end-to-end

### Stage 3: Dashboard & Project View Foundation
**Duration:** 2-3 days
**Dependencies:** Stage 2 completion

#### Sub-steps:
- [ ] Create Dashboard API endpoint (returns user's projects)
- [ ] Implement Dashboard UI component with project cards
- [ ] Add project statistics calculation (open emails, last updated)
- [ ] Create Project View API endpoint (returns project details with role-based filtering)
- [ ] Implement Project View UI layout (header, filters, tabs)
- [ ] Create Emails Timeline API endpoint (role-based email filtering)
- [ ] Implement Emails Timeline UI component
- [ ] Create Files & Links Timeline API endpoint
- [ ] Implement Files & Links Timeline UI component
- [ ] Add search and filter functionality (API and UI)
- [ ] Implement role-based UI visibility (hide/show buttons based on permissions)
- [ ] Add navigation between Dashboard and Project View
- [ ] Test dashboard and project view with different user roles

### Stage 4: Email Ingestion System
**Duration:** 3-4 days
**Dependencies:** Stage 2 completion

#### Sub-steps:
- [ ] Design email data model (Email, Attachment, EmailThread)
- [ ] Create database migrations for email-related tables
- [ ] Implement Gmail API integration service
- [ ] Implement Microsoft Graph API integration service
- [ ] Implement IMAP/SMTP integration service (generic email providers)
- [ ] Create email ingestion service (unified interface for all providers)
- [ ] Implement email polling/syncing mechanism
- [ ] Create email storage logic (save emails to database)
- [ ] Implement attachment handling and storage
- [ ] Create email ingestion API endpoints (admin/configuration)
- [ ] Add email provider configuration UI (Super User)
- [ ] Implement error handling and retry logic for email ingestion
- [ ] Add logging and monitoring for email ingestion
- [ ] Test email ingestion with test accounts

### Stage 5: AI Integration - Grok Service Layer
**Duration:** 2-3 days
**Dependencies:** Stage 4 completion

#### Sub-steps:
- [ ] Research and set up Grok (xAI) API access and authentication
- [ ] Create AI service abstraction layer (interface for easy provider switching)
- [ ] Implement Grok spam classification service
  - Create prompt templates for spam detection
  - Implement API call logic with error handling
  - Parse and validate Grok responses
  - Handle confidence scores
- [ ] Implement Grok project classification service
  - Create prompt templates using project descriptions
  - Implement API call with project context
  - Parse project ID and confidence scores
  - Handle "none" project responses
- [ ] Create configuration for confidence thresholds
- [ ] Implement fallback logic when Grok is unavailable (default to unassigned)
- [ ] Add retry logic and rate limiting for Grok API calls
- [ ] Create internal API endpoints for AI services
- [ ] Add logging and monitoring for AI service calls
- [ ] Test spam classification with sample emails
- [ ] Test project classification with sample emails and projects

### Stage 6: Email Processing Pipeline
**Duration:** 2-3 days
**Dependencies:** Stage 4 and Stage 5 completion

#### Sub-steps:
- [ ] Create email processing pipeline service
- [ ] Integrate spam classification into email ingestion flow
- [ ] Integrate project classification into email ingestion flow
- [ ] Implement auto-assignment logic (based on confidence thresholds)
- [ ] Implement unassigned email handling
- [ ] Create email status management (Open, In Progress, Waiting, Closed)
- [ ] Add email processing queue/job system (for async processing)
- [ ] Implement error handling and dead letter queue for failed emails
- [ ] Add email processing status tracking
- [ ] Create admin API endpoints for manual email processing triggers
- [ ] Test complete email processing flow (ingestion → spam check → routing → assignment)

### Stage 7: Incoming Mail Review (Super User)
**Duration:** 2-3 days
**Dependencies:** Stage 6 completion

#### Sub-steps:
- [ ] Create Incoming Mail Review API endpoint (unassigned and spam emails)
- [ ] Implement Incoming Mail Review UI screen
- [ ] Add email list view with AI suggestions (project, confidence score)
- [ ] Implement manual project assignment functionality
- [ ] Implement manual user/role assignment functionality
- [ ] Add spam marking functionality (mark as spam / not spam)
- [ ] Create email detail view in review screen
- [ ] Add bulk operations (assign multiple emails)
- [ ] Implement filters (unassigned, possible spam, date range)
- [ ] Add search functionality in review screen
- [ ] Test review workflow with Super User role

### Stage 8: Email Detail View & Internal Notes
**Duration:** 2-3 days
**Dependencies:** Stage 3 completion

#### Sub-steps:
- [ ] Create Email Detail API endpoint (email thread with client conversation)
- [ ] Implement Email Detail UI component
- [ ] Create Client Conversation section (email thread display)
- [ ] Create Internal Notes API endpoints (create, list, update)
- [ ] Implement Internal Notes UI section (separate from client conversation)
- [ ] Add @mention parsing and detection
- [ ] Implement mention notification system
- [ ] Create note author and timestamp display
- [ ] Add rich text editor for notes (optional)
- [ ] Implement note editing and deletion (with permissions)
- [ ] Test email detail view and notes with different roles

### Stage 9: Assignment & Workflow Management
**Duration:** 2-3 days
**Dependencies:** Stage 8 completion

#### Sub-steps:
- [ ] Create Assignment API endpoints (assign to user, assign to role)
- [ ] Implement assignment UI components (dropdowns, role selection)
- [ ] Add assignment display in email timeline and detail view
- [ ] Create email status management API endpoints
- [ ] Implement status change UI (dropdown, buttons)
- [ ] Add role-based status transition validation
- [ ] Create workflow rules engine (configurable status transitions)
- [ ] Implement assignment notifications
- [ ] Add assignment history/audit trail
- [ ] Test assignment and workflow with different roles

### Stage 10: Escalation System
**Duration:** 1-2 days
**Dependencies:** Stage 9 completion

#### Sub-steps:
- [ ] Create Escalation data model and database migration
- [ ] Create Escalation API endpoints (create, list, approve, reject)
- [ ] Implement "Escalate to Super User" UI button (PM only)
- [ ] Create escalation form with message/justification
- [ ] Implement Super User escalation review UI
- [ ] Add escalation notifications
- [ ] Create escalation status tracking
- [ ] Test escalation workflow (PM → Super User)

### Stage 11: Notifications System
**Duration:** 1-2 days
**Dependencies:** Stage 9 and Stage 10 completion

#### Sub-steps:
- [ ] Create Notifications data model and database migration
- [ ] Create Notifications API endpoints (list, mark as read, unread count)
- [ ] Implement in-app notification UI component
- [ ] Add notification triggers (assignment, mention, escalation)
- [ ] Create notification service for generating notifications
- [ ] Implement real-time notifications (WebSocket or polling)
- [ ] Add notification preferences (optional)
- [ ] Test notifications for all trigger types

### Stage 12: Advanced Features & Polish
**Duration:** 2-3 days
**Dependencies:** Stage 11 completion

#### Sub-steps:
- [ ] Enhance search functionality (full-text search, advanced filters)
- [ ] Implement email reply/compose functionality (if not done earlier)
- [ ] Add email forwarding functionality
- [ ] Implement file attachment download and preview
- [ ] Add link extraction and display in Files & Links Timeline
- [ ] Create admin UI for role and permission management
- [ ] Implement project archiving functionality
- [ ] Add bulk email operations (bulk assign, bulk status change)
- [ ] Enhance error handling and user feedback
- [ ] Add loading states and skeleton screens
- [ ] Implement responsive design for mobile devices
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### Stage 13: Testing & Quality Assurance
**Duration:** 2-3 days
**Dependencies:** Stage 12 completion

#### Sub-steps:
- [ ] Write unit tests for critical backend services (authentication, RBAC, email processing)
- [ ] Write unit tests for critical frontend components
- [ ] Create integration tests for API endpoints
- [ ] Create end-to-end tests for key user flows (login, dashboard, project view, assignment)
- [ ] Test role-based access control thoroughly (ensure no data leaks)
- [ ] Test AI integration error handling and fallbacks
- [ ] Perform security testing (authentication, authorization, input validation)
- [ ] Conduct performance testing (timeline load times, email processing speed)
- [ ] Test email ingestion with various providers
- [ ] Validate AI routing accuracy with test dataset
- [ ] Fix identified bugs and issues
- [ ] Code review and refactoring

### Stage 14: Deployment & Monitoring
**Duration:** 1-2 days
**Dependencies:** Stage 13 completion

#### Sub-steps:
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up CI/CD pipeline (GitHub Actions, GitLab CI, or similar)
- [ ] Create Docker containers for frontend and backend
- [ ] Configure production hosting (AWS/GCP/Azure)
- [ ] Set up domain and SSL certificates
- [ ] Configure production email provider integrations
- [ ] Set up monitoring and logging (error tracking, performance metrics)
- [ ] Create backup strategy for database
- [ ] Set up alerting for critical failures
- [ ] Deploy to staging environment
- [ ] Perform staging environment testing
- [ ] Deploy to production
- [ ] Create deployment documentation and runbooks

## Resource Links

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeORM Documentation](https://typeorm.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [xAI/Grok API](https://x.ai) - Official xAI documentation (verify current URL)

### Best Practices & Guides
- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/custom-providers)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/admin.html)
- [REST API Design Best Practices](https://restfulapi.net/)
- [JWT Authentication Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Role-Based Access Control Patterns](https://en.wikipedia.org/wiki/Role-based_access_control)

### Tutorials & Getting Started
- [Next.js Learn Course](https://nextjs.org/learn)
- [NestJS Getting Started](https://docs.nestjs.com/first-steps)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

### Security & Compliance
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Data Privacy Considerations for Email Systems](https://gdpr.eu/)

## Notes

- **AI Integration:** The Grok API integration should be abstracted behind a service layer to allow for easy switching to alternative LLM providers if needed.
- **Email Provider Support:** Start with one email provider (e.g., Gmail) and expand to others incrementally.
- **Performance:** Consider implementing caching for frequently accessed data (projects, user permissions) and pagination for large email lists.
- **Scalability:** Design the email processing pipeline to handle high volumes using queues and background jobs.
- **Security:** Ensure all role-based access control is enforced on the backend, not just the frontend.
- **Testing:** Prioritize testing of RBAC to prevent data leaks between projects and roles.

