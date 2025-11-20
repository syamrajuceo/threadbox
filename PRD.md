# Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Product Name

**Product Name:**  
THREADBOX
*(Internal codename – can be renamed later.)*

---

### 1.2 Project Summary

This project aims to build an **AI-powered, project-centric email management web application** that centralizes all incoming emails, automatically assigns them to the correct client projects, enforces role-based visibility, and enables internal collaboration.

Key aspects:

- Ingest all emails into a **central company inbox**.
- Use **Grok (xAI)** as the external LLM for:
  - **Spam classification**
  - **Project classification/routing** using detailed project descriptions.
- Provide a **Super User** with full visibility and control over:
  - Projects
  - Roles & permissions
  - Incoming mail review (including spam/unassigned)
- Provide **Project Managers** and team members with a **single, consistent UI** where:
  - The layout is the same for everyone.
  - The **content and actions** differ based on their **roles and permissions**.
- Ensure that project members only see **emails relevant to their project and assignment**, not the entire inbox.

---

### 1.3 Target Audience

**Primary Users**

1. **Super User / Operations Admin**
   - Owns global configuration and governance.
   - Reviews unassigned and spam-like emails.
   - Creates projects and defines roles and permissions.

2. **Project Managers (PMs)**
   - Own communication with clients for a specific project.
   - Manage project members and assignments.
   - Coordinate execution via internal notes and email assignment.

3. **Project Team Members (Developers, Testers, Custom Roles)**
   - Execute tasks based on emails assigned to them/their role.
   - Collaborate through internal notes and mentions.
   - Do not see global or admin features.

**Secondary Stakeholders**

- **Leadership / Management** – visibility into whether communication is organized and controlled.  
- **IT / Infrastructure** – responsible for email integration, deployment, monitoring, and security.

---

## 2. Goals and Objectives

### 2.1 Primary Goals

- Provide a **single, project-centric hub** for internal teams to manage all client communication via email.
- Use **Grok-based AI** to:
  - Filter out spam.
  - Automatically route emails to the correct project based on project descriptions.
- Ensure **role-based visibility and control**, so users only see and act on emails they should access.
- Enable **internal collaboration** on each email thread via notes and mentions, separate from client communication.

---

### 2.2 Objectives

1. **Automated Routing**
   - Reliably classify non-spam emails into the correct project using Grok and project descriptions.
   - Use a confidence threshold to decide between auto-assignment vs manual review.

2. **Noise & Spam Reduction**
   - Filter spam and suspicious emails using AI.
   - Keep such emails out of project timelines, exposing them only to the Super User for review.

3. **Role-Based Access**
   - **Super User**: Full system-wide visibility and control.  
   - **Project Manager**: Full visibility within their projects.  
   - **Other project roles**: Only see emails assigned to them/their role.

4. **Unified yet Adaptive UI**
   - Same **UI layout** for all roles.
   - Role-based **content and actions**:
     - Different timelines per user (filtered by access).
     - Different available buttons (assign, manage members, etc.).

5. **Internal Collaboration**
   - Internal notes & mentions on each email.
   - Clear separation between internal comments and client-visible emails.

6. **Governance and Auditability**
   - Super User tools for:
     - Reviewing and correcting AI routing.
     - Managing role definitions and membership.
     - Auditing critical actions.

---

## 3. Features and Functional Requirements

### 3.1 User Stories

#### Super User

- **SU-1**: As a Super User, I want to see **all incoming emails**, including unassigned and possible spam, so I can review and correct AI decisions.
- **SU-2**: As a Super User, I want a dedicated **Incoming Mail Review screen** to review new emails, confirm spam, and assign emails to projects.
- **SU-3**: As a Super User, I want to **create and configure projects** with detailed descriptions so Grok can use them for accurate routing.
- **SU-4**: As a Super User, I want to **create and edit roles and permissions** so I can control what different types of users can do.
- **SU-5**: As a Super User, I want to **assign users to projects with specific roles** so users only access relevant projects.
- **SU-6**: As a Super User, I want errors in AI routing and spam filtering to be corrected manually and logged so the system can be improved over time.

#### Project Manager

- **PM-1**: As a Project Manager, I want to see **all emails** tagged to my project so I can manage communication and workload.
- **PM-2**: As a Project Manager, I want to **assign emails to specific users or roles** (Developer, Tester, etc.) so the right person handles each task.
- **PM-3**: As a Project Manager, I want to **add internal notes** and mention team members on an email so I can coordinate without emailing internally.
- **PM-4**: As a Project Manager, I want to **reply to and compose emails to the client** from within the project view so I don’t have to switch tools.
- **PM-5**: As a Project Manager, I want to **escalate specific emails to the Super User** for important or sensitive cases where higher-level approval or access is needed.
- **PM-6**: As a Project Manager, I want to **manage project members and their roles** (if allowed) so I can maintain my team’s access.

#### Developers / Testers / Other Roles

- **DEV-1**: As a Developer/Tester, I want to see a **timeline of only the emails assigned to me or my role** so I can focus on my work.
- **DEV-2**: As a Developer/Tester, I want to **add internal notes and mention others** so I can clarify requirements with the PM or teammates.
- **DEV-3**: As a Developer/Tester, I want to **update the status** of my assigned emails (e.g., Open, In Progress, Closed) so everyone knows the progress.

#### Shared

- **ALL-1**: As any user, I want to see a **Dashboard of the projects I belong to** when I log in so I can quickly access my workspaces.
- **ALL-2**: As any user, I want the **UI layout to be consistent** across projects and roles so I don’t have to learn different interfaces.
- **ALL-3**: As any user, I want **search and filters** inside a project so I can quickly find relevant emails.

---

### 3.2 Functional Requirements

#### 3.2.1 Authentication & User Management

- **FR-1**: The system shall allow users to log in via email + password (and optionally via SSO in future).
- **FR-2**: The system shall store and manage user status (Active/Inactive).
- **FR-3**: The Super User shall be able to view a list of users and (optionally) change activation status.

#### 3.2.2 Projects

- **FR-4**: The Super User shall be able to create projects by specifying:
  - Project name  
  - Client name/identifier  
  - Detailed project description for AI routing  
  - Optional metadata like domains, keywords, or known addresses.
- **FR-5**: The Super User shall be able to edit project details.
- **FR-6**: The Super User shall be able to archive projects (hidden from general user dashboards but retained in storage).

#### 3.2.3 Roles & Permissions

- **FR-7**: The system shall support:
  - **Global roles** (e.g., Super User).  
  - **Project roles** (e.g., Project Manager, Developer, Tester, custom).
- **FR-8**: For each role, the Super User shall be able to define:
  - View scope (all project emails vs assigned-only).  
  - Ability to assign emails.  
  - Ability to manage members within a project.  
  - Ability to send client emails.  
  - Ability to change email status.
- **FR-9**: A user may have:
  - One **global role**.  
  - One **role per project**, across multiple projects.

#### 3.2.4 User–Project Membership

- **FR-10**: Super User (and optionally PM) shall be able to add users to a project and assign a project role.
- **FR-11**: A user must have exactly **one role per project** they belong to.
- **FR-12**: A user can belong to multiple projects with different roles.
- **FR-13**: Super User (and optionally PM, based on permissions) shall be able to remove users from a project or change their role.

#### 3.2.5 Email Ingestion

- **FR-14**: The system shall ingest emails from configured company inboxes via provider APIs or IMAP.
- **FR-15**: For each incoming email, the system shall store:
  - Sender  
  - Recipients (To, Cc)  
  - Subject  
  - Body (text/HTML)  
  - Attachments  
  - Timestamp  
  - Spam classification (initial)  
  - Project assignment (nullable)  
  - Assignment to user/role (nullable)  
  - Email status (e.g., Open, In Progress, Waiting, Closed).

#### 3.2.6 AI Spam Filtering (using Grok)

- **FR-16**: The system shall call **Grok** to classify emails as spam vs non-spam, with a confidence score.
- **FR-17**: Emails classified as high-confidence spam shall:
  - Not be routed to any project automatically.  
  - Be visible only in the **Incoming Mail Review** for Super User.
- **FR-18**: Emails classified as “possible spam” (mid-confidence) shall:
  - Remain unassigned.  
  - Be flagged as **Possible Spam** in Incoming Mail Review.

#### 3.2.7 AI Project Classification (using Grok)

- **FR-19**: For non-spam emails, the system shall call **Grok** to classify which project an email belongs to, using:
  - Email content (subject + body).  
  - A list of project descriptions and metadata.
- **FR-20**: Grok’s output shall include:
  - Predicted project id (or “none”).  
  - Confidence score.
- **FR-21**: If confidence ≥ a configurable threshold:
  - The email shall be automatically assigned to that project.
- **FR-22**: If confidence < threshold or project = “none”:
  - The email shall remain **Unassigned** and appear only in Incoming Mail Review.

#### 3.2.8 Incoming Mail Review (Super User Only)

- **FR-23**: The system shall provide a **separate Incoming Mail Review screen** accessible only to the Super User.
- **FR-24**: This screen shall show:
  - All unassigned emails.  
  - Emails flagged as possible spam.  
  - Grok’s suggested project and confidence (if any).
- **FR-25**: For each email, the Super User shall be able to:
  - Assign it to a project.  
  - Assign to a specific user and/or project role (optional).  
  - Mark it as Spam.  
  - Mark it as Not Spam and trigger routing or direct assignment.

#### 3.2.9 Dashboard

- **FR-26**: After login, the user shall see a Dashboard listing all projects they belong to.
- **FR-27**: Each project card on the Dashboard shall show:
  - Project name  
  - Client name (optional)  
  - User’s role in that project  
  - Basic stats (e.g., number of open/assigned emails, last updated).
- **FR-28**: The Super User’s Dashboard shall show all projects, plus a link to the Admin/Incoming Mail Review area.
- **FR-29**: PMs and other roles shall **not** see admin or review links.

#### 3.2.10 Project View & Timeline (Common UI)

- **FR-30**: The system shall provide a **single Project View layout** for all users.
- **FR-31**: Project View shall include:
  - Project name and user’s role.  
  - Filters (date, status, tags, assignee).  
  - Tabs:
    - `Emails Timeline`  
    - `Files & Links Timeline`
- **FR-32**: Emails Timeline shall show emails as chronological events with:
  - Timestamp  
  - Sender & recipients  
  - Subject  
  - Status  
  - Assignee (user/role)  
  - Comment count (internal notes).
- **FR-33**: Files & Links Timeline shall show attachments and extracted links sorted by timestamp, linked back to their source emails.

#### 3.2.11 Role-Based Timeline Visibility

- **FR-34**: Super User & Project Manager:
  - Shall see **all emails** in that project’s timeline.
- **FR-35**: Developer/Tester/Custom roles:
  - Shall see only:
    - Emails assigned directly to them, and/or  
    - Emails assigned to their role.

#### 3.2.12 Email Detail View

- **FR-36**: Clicking an email in the timeline shall open an Email Detail View including:
  - **Client Conversation**: full email thread with the client.  
  - **Internal Notes**: separate internal comments list.
- **FR-37**: Based on role permissions, actions shall include:
  - Reply / Forward (PM, Developer if allowed).  
  - Change status (Open/In Progress/Waiting/Closed).  
  - Assign/Reassign (PM/Super User).

#### 3.2.13 Internal Notes & Mentions

- **FR-38**: Every email shall support internal notes visible only to internal users with access to that email.
- **FR-39**: Notes shall show:
  - Author name  
  - Timestamp  
  - Content
- **FR-40**: Notes input shall support `@mentions` of project members.
- **FR-41**: Mentioned users shall receive an in-app notification.

#### 3.2.14 Assignment & Workflow

- **FR-42**: PMs and Super Users shall be able to assign emails:
  - To a specific user.  
  - To a project role (e.g., Developer, Tester).
- **FR-43**: Developers/Testers shall see those assigned emails in their project timeline.
- **FR-44**: Emails shall have a status lifecycle (at minimum):
  - Open  
  - In Progress  
  - Waiting on Client  
  - Closed
- **FR-45**: Status transitions allowed per role shall be configurable in the role permissions.

#### 3.2.15 Escalation to Super User

- **FR-46**: PM shall be able to “Escalate to Super User” on a specific email.
- **FR-47**: Escalations shall include a message/justification.
- **FR-48**: Super User shall see escalations and be able to:
  - Approve or reject requests.  
  - Adjust access or routing if needed.

#### 3.2.16 Search & Filters

- **FR-49**: Within a project, users shall be able to search emails by:
  - Subject  
  - Sender  
  - Tags  
  - Status  
  - Date range
- **FR-50**: Search results must respect role-based access (no leaks).

#### 3.2.17 Notifications

- **FR-51**: The system shall send in-app notifications for:
  - New email assignment to a user.  
  - New @mention in internal notes.  
  - Escalation updates (for PM and Super User).

---

### 3.3 Non-Functional Requirements

**Security**

- **NFR-1**: All communication between client and server shall be encrypted via HTTPS.
- **NFR-2**: Role-based permissions must be enforced on the backend.
- **NFR-3**: Internal notes must never be exposed in emails sent to clients.
- **NFR-4**: Data sent to Grok must comply with internal security policies; only necessary context should be shared.

**Performance**

- **NFR-5**: Project timelines shall load within ~2–3 seconds under normal load.
- **NFR-6**: AI spam and project classification via Grok shall complete within a reasonable time (target <60 seconds from email arrival).

**Reliability**

- **NFR-7**: No email shall be dropped due to AI or network failures:
  - If Grok is unavailable, emails must default to **Unassigned** and be visible in Incoming Mail Review.
- **NFR-8**: System failures in AI or email ingestion must be logged and alerted.

**Scalability**

- **NFR-9**: The system should handle growth in:
  - Number of projects.  
  - Number of users.  
  - Volume of emails.

**Maintainability & Extensibility**

- **NFR-10**: AI integration with Grok shall be encapsulated behind an internal service layer so that models or providers can be updated with minimal impact.
- **NFR-11**: Role/permission definitions should be changeable without code changes (e.g., via config/admin UI).

---

## 4. User Interface (UI) / User Experience (UX) Requirements

### 4.1 UI/UX Design Specifications

- Common layout across roles:
  - **Login → Dashboard → Project View → Timeline → Email Detail**
- Visual separation between:
  - Client Conversation (emails)  
  - Internal Notes (collaboration)
- Admin features and Incoming Mail Review must be clearly separated and visible **only** to Super User.
- The UI should minimize cognitive load for project members:
  - Only show navigation items relevant to their role.  
  - Simple, table or card-based layouts for timelines.

---

### 4.2 User Flows

Key flows to be designed:

1. **Login & Dashboard**
   - User logs in → sees only their projects (Super User sees all) → selects a project.

2. **Viewing a Project Timeline**
   - User clicks a project → Project View opens → Emails Timeline loads → User filters/searches → opens a specific email.

3. **Super User Incoming Mail Review**
   - Super User → Admin/Review → sees unassigned & possible spam emails → reviews AI suggestions → assigns project or marks as spam.

4. **Project Manager Assignment Flow**
   - PM → Project View → opens new email → adds internal note with instructions → assigns email to a Developer/Tester.

5. **Developer Working Flow**
   - Developer → Project View → sees only assigned emails → opens one → adds notes / updates status / replies if allowed.

6. **Escalation Flow**
   - PM → Email Detail → “Escalate to Super User” → adds reason → Super User sees and responds.

---

### 4.3 Wireframes / Mockups

(To be created by design team based on the flows and layout described above.)

At minimum:

- Login screen  
- Dashboard (project cards/list)  
- Project View (with Emails Timeline and Files & Links Timeline tabs)  
- Email Detail view (client thread + internal notes)  
- Incoming Mail Review screen (Super User)  
- Admin pages for Projects, Roles, and Users.

---

## 5. Technical Requirements

### 5.1 System Architecture

High-level components:

- **Frontend (Web App)**
  - SPA (React/Next.js or similar).
  - Communicates with backend via REST/GraphQL APIs.

- **Backend API**
  - Authentication & authorization.
  - Users, projects, roles, memberships.
  - Email ingestion and storage.
  - Internal notes, assignments, and notifications.
  - Integration with Grok for spam and routing.

- **Email Ingestion Service**
  - Connects to email providers (e.g., Gmail, Outlook, custom SMTP/IMAP).
  - Streams emails into the backend for processing.

- **AI Service Layer**
  - Internal wrapper for **Grok** calls:
    - `/ai/spam-check`  
    - `/ai/project-classify`
  - Handles:
    - Prompt construction.  
    - API calls to Grok.  
    - Parsing responses.  
    - Fallbacks when Grok is unavailable.

- **Database**
  - Relational DB (e.g., PostgreSQL) storing:
    - Users, roles, projects, memberships.  
    - Emails, notes, attachments/links.  
    - Audit logs, notifications.

- **Notifications Service**
  - Sends in-app notifications for mentions, assignments, and escalations.

- **Monitoring & Logging**
  - Logging of system events and AI errors.
  - Metrics for latency, error rates, routing accuracy.

---

### 5.2 API Specifications (High-Level)

- `/auth/*`
  - Login, refresh token, logout.

- `/users/*`
  - List users, get user, (Super User: manage user status).

- `/projects/*`
  - Create/edit/archive projects.
  - Get project details.
  - Manage project members and roles (depending on role).

- `/roles/*`
  - Get role list.
  - Create/edit/delete roles (Super User).

- `/emails/*`
  - Fetch project emails with filters.
  - Get email detail.
  - Assign email (user/role).
  - Update email status.

- `/notes/*`
  - Add internal note.
  - List notes for an email.

- `/incoming-review/*` (Super User only)
  - List unassigned/possible spam emails.
  - Assign to project/user/role.
  - Mark spam / not spam.

- `/notifications/*`
  - Fetch user notifications.
  - Mark as read.

- `/ai/spam-check` (internal)
  - Backend → Grok: classify spam.

- `/ai/project-classify` (internal)
  - Backend → Grok: choose project based on email + project descriptions.

---

### 5.3 Technology Stack (Suggested)

- **Frontend**: React / Next.js (TypeScript)  
- **Backend**: Node.js / NestJS (or similar)  
- **Database**: PostgreSQL  
- **Email Integration**: Gmail/Outlook APIs or IMAP/SMTP  
- **LLM**: **Grok (xAI)** via official API  
- **Hosting**: AWS/GCP/Azure (containers or serverless as appropriate)

---

## 6. Timeline and Milestones

### 6.1 Project Timeline (Example Skeleton)

| Phase      | Description                                       |
|-----------|---------------------------------------------------|
| Planning  | Requirements finalization, architecture           |
| Design    | UX flows, wireframes, visual designs              |
| Dev – MVP | Core features: projects, roles, manual routing, basic email view |
| Dev – AI  | Integrate Grok for spam and project routing       |
| QA & UAT  | Functional, security, and performance tests       |
| Launch    | Production deployment                             |
| Iteration | Tuning AI, analytics, and enhancements            |

*(Dates to be filled separately.)*

---

### 6.2 Key Milestones

- M1: PRD approved.  
- M2: Dashboard + Project View + basic email ingestion working.  
- M3: Role-based access and internal notes implemented.  
- M4: Grok-based spam and routing integrated.  
- M5: Incoming Mail Review & Admin area fully functional.  
- M6: UAT sign-off and production release.

---

## 7. Dependencies

### 7.1 External Dependencies

- Email provider APIs (e.g., Google Workspace, Microsoft 365, or IMAP server).  
- **Grok (xAI)**:
  - API access and keys.  
  - Usage quota and billing.
- Cloud provider for hosting.

### 7.2 Internal Dependencies

- Design team for UI/UX.  
- DevOps for deployment, monitoring, and scaling.  
- Security/compliance review if emails contain sensitive content.

---

## 8. Risks and Mitigation Strategies

- **R1: AI Misclassification (Routing)**  
  - *Mitigation*: Conservative confidence threshold; fallback to Unassigned; continuous feedback loop from Super User corrections.

- **R2: Spam Misclassification**  
  - *Mitigation*: Fetch suspicious emails into review instead of auto-deleting; allow Super User corrections.

- **R3: Access Control Bugs**  
  - *Mitigation*: Backend-enforced RBAC; thorough testing; audit logs.

- **R4: Grok API Downtime or Latency**  
  - *Mitigation*: Fallback to Unassigned; retry and alert mechanisms.

- **R5: Adoption Risk**  
  - *Mitigation*: Simple UI; minimal friction for PMs and team members; onboarding & training.

---

## 9. Budget and Resource Allocation

*(Numbers to be filled by you.)*

### 9.1 Estimated Budget

- Development  
- Design  
- Infrastructure & Hosting  
- Grok API usage (LLM cost)  
- Contingency

### 9.2 Resource Allocation

- Product Owner  
- Tech Lead / Architect  
- Backend Developer(s)  
- Frontend Developer(s)  
- AI/ML Engineer (or responsible dev)  
- UI/UX Designer  
- QA Engineer  
- DevOps Engineer  

---

## 10. Acceptance Criteria

### 10.1 Testing Criteria

- All critical user stories (SU, PM, Dev) implemented and passing tests.  
- Role-based access verified:
  - Super User sees everything.  
  - PM sees only project-level content.  
  - Dev/Tester sees only assigned emails.
- AI routing accuracy meets agreed baseline on test data.  
- No critical security or data leakage issues.  
- Performance targets (timeline load, review page) met.

### 10.2 User Acceptance Testing (UAT)

- Super User confirms:
  - Incoming Mail Review and Admin flows are usable and stable.
- At least one PM and one Developer confirm:
  - Timelines, assignments, and notes flows match their real-world needs.
- Stakeholders agree this can replace or meaningfully augment current email workflows.

---

## 11. Post-Launch Monitoring and Support

### 11.1 Monitoring Plan

- Track:
  - Emails ingested per day.  
  - Auto-routed vs manually routed percentages.  
  - Spam vs non-spam classification accuracy.  
  - Grok latency and error rates.
- Alerts:
  - Email ingestion failures.  
  - Grok API failures.  
  - Unusually high volume of Unassigned emails.

### 11.2 Support Plan

- Assign owner/team responsible for:
  - Production issues.  
  - Bug fixes.
- Provide internal support channel (e.g., Slack/Teams) for PMs and team members.  
- Define escalation path and target response times.

---

## 12. Appendix

- Detailed Role–Permission matrix (to be defined).  
- ERD / Data model diagrams.  
- Sample project descriptions for AI routing.  
- Sample test cases for spam and routing validation.