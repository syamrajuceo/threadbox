# UI/UX Design Documentation

## Design System Specifications

### Color Palette

#### Primary Colors
- **Primary Blue:** `#2563EB` - Main brand color, used for primary actions and links
- **Primary Dark:** `#1E40AF` - Hover states and emphasis
- **Primary Light:** `#3B82F6` - Secondary actions

#### Secondary Colors
- **Success Green:** `#10B981` - Success messages, completed status
- **Warning Yellow:** `#F59E0B` - Warnings, pending status
- **Error Red:** `#EF4444` - Errors, spam indicators
- **Info Blue:** `#3B82F6` - Information messages

#### Neutral Colors
- **Background:** `#FFFFFF` - Main background
- **Background Secondary:** `#F9FAFB` - Secondary backgrounds, cards
- **Background Tertiary:** `#F3F4F6` - Subtle backgrounds
- **Text Primary:** `#111827` - Main text color
- **Text Secondary:** `#6B7280` - Secondary text, labels
- **Text Tertiary:** `#9CA3AF` - Muted text, timestamps
- **Border:** `#E5E7EB` - Borders, dividers
- **Border Dark:** `#D1D5DB` - Stronger borders

#### Status Colors
- **Open:** `#3B82F6` (Blue)
- **In Progress:** `#F59E0B` (Yellow)
- **Waiting on Client:** `#8B5CF6` (Purple)
- **Closed:** `#10B981` (Green)
- **Spam:** `#EF4444` (Red)
- **Unassigned:** `#6B7280` (Gray)

### Typography

#### Font Family
- **Primary Font:** Inter or System UI stack
  - `font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;`
- **Monospace Font:** For code, email addresses, timestamps
  - `font-family: 'Fira Code', 'Courier New', monospace;`

#### Font Sizes
- **Heading 1 (H1):** `2.25rem` (36px) - Page titles
- **Heading 2 (H2):** `1.875rem` (30px) - Section titles
- **Heading 3 (H3):** `1.5rem` (24px) - Subsection titles
- **Heading 4 (H4):** `1.25rem` (20px) - Card titles
- **Body Large:** `1.125rem` (18px) - Important body text
- **Body:** `1rem` (16px) - Default body text
- **Body Small:** `0.875rem` (14px) - Secondary text
- **Caption:** `0.75rem` (12px) - Labels, timestamps

#### Font Weights
- **Bold:** `700` - Headings, emphasis
- **Semi-bold:** `600` - Subheadings, important text
- **Regular:** `400` - Body text
- **Light:** `300` - Muted text

### Spacing System

Based on 4px grid system:
- **XS:** `0.25rem` (4px)
- **SM:** `0.5rem` (8px)
- **MD:** `1rem` (16px)
- **LG:** `1.5rem` (24px)
- **XL:** `2rem` (32px)
- **2XL:** `3rem` (48px)
- **3XL:** `4rem` (64px)

### Component Guidelines

#### Buttons

**Primary Button:**
- Background: Primary Blue
- Text: White
- Padding: `0.75rem 1.5rem`
- Border radius: `0.5rem`
- Font weight: 600
- Hover: Darker shade, slight elevation

**Secondary Button:**
- Background: Transparent
- Border: 1px solid Border color
- Text: Primary Blue
- Padding: `0.75rem 1.5rem`
- Border radius: `0.5rem`
- Hover: Background Secondary

**Danger Button:**
- Background: Error Red
- Text: White
- Same padding and radius as Primary

**Icon Button:**
- Square, `2.5rem × 2.5rem`
- Icon centered
- Hover: Background Secondary

#### Cards

- Background: White
- Border: 1px solid Border color
- Border radius: `0.75rem`
- Padding: `1.5rem`
- Box shadow: Subtle shadow for elevation
- Hover: Slight elevation increase (if interactive)

#### Input Fields

- Border: 1px solid Border color
- Border radius: `0.5rem`
- Padding: `0.75rem 1rem`
- Focus: Border Primary Blue, outline ring
- Error state: Border Error Red
- Placeholder: Text Tertiary color

#### Badges/Tags

- Background: Background Secondary
- Text: Text Primary
- Padding: `0.25rem 0.75rem`
- Border radius: `9999px` (pill shape)
- Font size: Body Small

#### Status Badges

- Use status colors for background
- Text: White (for colored backgrounds) or Text Primary (for light backgrounds)
- Same padding and shape as regular badges

## UI Component Specifications

### Layout Components

#### Header
- **Height:** `4rem` (64px)
- **Background:** White
- **Border bottom:** 1px solid Border color
- **Content:**
  - Left: Logo/Brand name
  - Center: Navigation (if applicable)
  - Right: User menu, notifications icon
- **Sticky:** Yes, stays at top on scroll

#### Sidebar (if used)
- **Width:** `16rem` (256px) collapsed, `20rem` (320px) expanded
- **Background:** Background Secondary
- **Border right:** 1px solid Border color
- **Sticky:** Yes
- **Content:** Navigation links, project list

#### Main Content Area
- **Padding:** `2rem` (32px) on desktop, `1rem` (16px) on mobile
- **Max width:** `1280px` (centered)
- **Background:** Background

#### Footer
- **Height:** `3rem` (48px)
- **Background:** Background Secondary
- **Border top:** 1px solid Border color
- **Content:** Copyright, links

### Page-Specific Components

#### Login Page
- **Layout:** Centered card on full-screen background
- **Card:**
  - Max width: `28rem` (448px)
  - Padding: `2rem`
  - Centered vertically and horizontally
- **Form:**
  - Email input
  - Password input
  - "Remember me" checkbox
  - Submit button (full width)
  - "Forgot password?" link (if implemented)

#### Dashboard
- **Layout:** Grid of project cards
- **Project Card:**
  - Min height: `12rem` (192px)
  - Shows: Project name, client name, role badge, stats (open emails count, last updated)
  - Hover: Slight elevation, cursor pointer
  - Click: Navigate to project view
- **Grid:**
  - Desktop: 3 columns
  - Tablet: 2 columns
  - Mobile: 1 column
  - Gap: `1.5rem`

#### Project View

**Project Header:**
- **Height:** Auto
- **Padding:** `1.5rem 2rem`
- **Background:** White
- **Border bottom:** 1px solid Border color
- **Content:**
  - Project name (H2)
  - Client name (Body Small, Text Secondary)
  - Role badge
  - Action buttons (if permitted by role)

**Filters Bar:**
- **Padding:** `1rem 2rem`
- **Background:** Background Secondary
- **Border bottom:** 1px solid Border color
- **Content:**
  - Search input
  - Status filter dropdown
  - Date range picker
  - Assignee filter dropdown
  - Clear filters button

**Tabs:**
- **Height:** `3rem` (48px)
- **Border bottom:** 1px solid Border color
- **Active tab:** Border bottom 2px Primary Blue, Text Primary Blue
- **Inactive tab:** Text Secondary
- **Tabs:** "Emails Timeline", "Files & Links Timeline"

**Timeline:**
- **Padding:** `1.5rem 2rem`
- **Layout:** Vertical list
- **Email Card:**
  - Padding: `1rem 1.5rem`
  - Border left: 3px solid (status color)
  - Margin bottom: `1rem`
  - Hover: Background Secondary
  - **Content:**
    - Timestamp (Caption, Text Tertiary)
    - Sender & recipients (Body, Text Primary)
    - Subject (Body, Semi-bold)
    - Status badge
    - Assignee badge (if assigned)
    - Comment count badge (if has notes)

#### Email Detail View

**Layout:** Two-column or stacked layout
- **Left/Top:** Client Conversation
- **Right/Bottom:** Internal Notes

**Client Conversation Section:**
- **Header:** "Client Conversation"
- **Background:** White
- **Border:** 1px solid Border color
- **Border radius:** `0.75rem`
- **Padding:** `1.5rem`
- **Email Thread:**
  - Each email: Border bottom, padding bottom
  - **Email Header:**
    - From/To/Cc (Body Small)
    - Subject (Body, Semi-bold)
    - Date (Caption, Text Tertiary)
  - **Email Body:**
    - HTML rendering or plain text
    - Attachments list (if any)
  - **Actions:** Reply, Forward buttons (if permitted)

**Internal Notes Section:**
- **Header:** "Internal Notes" with "Add Note" button
- **Background:** Background Secondary
- **Border:** 1px solid Border color
- **Border radius:** `0.75rem`
- **Padding:** `1.5rem`
- **Note Item:**
  - Background: White
  - Padding: `1rem`
  - Margin bottom: `1rem`
  - Border radius: `0.5rem`
  - **Content:**
    - Author name (Body, Semi-bold)
    - Timestamp (Caption, Text Tertiary)
    - Note content (Body)
    - Mentions highlighted (Primary Blue)

**Note Editor:**
- **Textarea:** Full width, min height `6rem`
- **Mention support:** @ symbol triggers user dropdown
- **Actions:** "Post Note" button, "Cancel" link

**Action Panel:**
- **Location:** Top right of email detail view
- **Actions (role-based):**
  - Assign to user/role dropdown
  - Status change dropdown
  - Escalate button (PM only)
  - Delete/Archive (Super User only)

#### Incoming Mail Review (Super User Only)

**Layout:** Table or card list view

**Filters:**
- Unassigned emails
- Possible spam
- Date range
- Search

**Email Row/Card:**
- Shows: Sender, subject, date, AI suggestion (project + confidence), spam classification
- Actions: Assign to project, Assign to user/role, Mark as spam, Mark as not spam
- Spam indicator: Red border or badge

**Bulk Actions:**
- Select multiple emails
- Bulk assign to project
- Bulk mark as spam

#### Admin Pages

**Projects Management:**
- Table or card list of all projects
- Actions: Create, Edit, Archive
- Search and filters

**Roles Management:**
- Table of roles with permissions
- Actions: Create, Edit, Delete
- Permission matrix view

**Users Management:**
- Table of users
- Columns: Name, Email, Status, Global Role, Projects
- Actions: Edit, Activate/Deactivate

## User Experience Flow Diagrams

### Flow 1: Login & Dashboard

```
[Login Page]
    ↓ (Enter credentials, click Login)
[Authentication]
    ↓ (Success)
[Dashboard]
    ↓ (Click project card)
[Project View]
```

**Key Points:**
- Super User sees all projects + Admin link
- PM/Dev see only their projects
- Dashboard loads quickly (< 2 seconds)

### Flow 2: Viewing Project Timeline

```
[Project View]
    ↓ (Page loads)
[Emails Timeline Tab - Active]
    ↓ (Timeline loads with role-based filtering)
[Email List Displayed]
    ↓ (Click email)
[Email Detail View]
    ↓ (View client conversation or internal notes)
[Back to Timeline] or [Take Action]
```

**Key Points:**
- Timeline respects role-based visibility
- Filters persist during session
- Smooth transitions between views

### Flow 3: Super User Incoming Mail Review

```
[Super User Dashboard]
    ↓ (Click "Incoming Mail Review")
[Incoming Mail Review Screen]
    ↓ (View unassigned/spam emails)
[Review Email]
    ↓ (See AI suggestions)
[Take Action:]
    - Assign to project
    - Assign to user/role
    - Mark as spam
    - Mark as not spam
[Email Processed]
```

**Key Points:**
- Clear AI confidence indicators
- Easy bulk operations
- Quick assignment workflow

### Flow 4: Project Manager Assignment Flow

```
[Project View - Email Timeline]
    ↓ (Click new email)
[Email Detail View]
    ↓ (Click "Add Internal Note")
[Note Editor]
    ↓ (Add note with @mentions, instructions)
[Post Note]
    ↓ (Click "Assign")
[Assignment Panel]
    ↓ (Select user or role)
[Email Assigned]
    ↓ (Notification sent to assignee)
```

**Key Points:**
- Smooth note creation
- Easy mention system
- Clear assignment options

### Flow 5: Developer Working Flow

```
[Developer Dashboard]
    ↓ (Click project)
[Project View]
    ↓ (See only assigned emails)
[Click Assigned Email]
[Email Detail View]
    ↓ (Read client conversation)
[Add Internal Note]
    ↓ (Ask questions, @mention PM)
[Update Status]
    ↓ (Change to "In Progress")
[Status Updated]
```

**Key Points:**
- Focused view (only assigned emails)
- Easy status updates
- Clear collaboration tools

### Flow 6: Escalation Flow

```
[PM in Email Detail View]
    ↓ (Click "Escalate to Super User")
[Escalation Modal]
    ↓ (Enter reason/justification)
[Submit Escalation]
    ↓ (Notification sent to Super User)
[Super User Dashboard]
    ↓ (See escalation notification)
[Review Escalation]
    ↓ (Approve/Reject/Adjust)
[Escalation Resolved]
```

**Key Points:**
- Clear escalation reasons
- Super User gets notified
- Easy resolution workflow

## Responsive Design Requirements

### Breakpoints

- **Mobile:** `0px - 640px`
- **Tablet:** `641px - 1024px`
- **Desktop:** `1025px - 1440px`
- **Large Desktop:** `1441px+`

### Mobile Adaptations

#### Navigation
- Hamburger menu instead of sidebar
- Bottom navigation bar for main actions (optional)

#### Dashboard
- Single column project cards
- Reduced padding

#### Project View
- Stacked layout (filters above timeline)
- Full-width tabs
- Simplified email cards

#### Email Detail View
- Stacked layout (Client Conversation above Internal Notes)
- Full-width action buttons
- Simplified note editor

#### Tables
- Convert to card layout on mobile
- Horizontal scroll as fallback

### Tablet Adaptations

- Two-column layouts where appropriate
- Sidebar can be collapsible
- Maintain desktop functionality with adjusted spacing

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

#### Keyboard Navigation
- All interactive elements accessible via keyboard
- Tab order follows visual flow
- Skip links for main content
- Focus indicators visible (2px outline, Primary Blue)

#### Screen Reader Support
- Semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- ARIA labels for icons and buttons
- ARIA live regions for dynamic content (notifications)
- Alt text for images
- Form labels associated with inputs

#### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Minimum 3:1 ratio
- Status colors: Ensure sufficient contrast

#### Focus Management
- Focus trap in modals
- Return focus after modal close
- Focus management for dynamic content

### Accessibility Features

- **Reduced Motion:** Respect `prefers-reduced-motion` media query
- **High Contrast Mode:** Support system high contrast settings
- **Font Scaling:** Support up to 200% zoom without breaking layout
- **Keyboard Shortcuts:** 
  - `/` - Focus search
  - `Esc` - Close modals
  - `?` - Show keyboard shortcuts help

## Style Guide and Branding

### Logo and Branding
- Logo placement: Top left of header
- Brand name: "Threadbox" or custom branding
- Tagline: Optional, below logo or in footer

### Icons
- **Icon Library:** Use consistent icon set (e.g., Heroicons, Lucide)
- **Size:** Standard sizes: 16px, 20px, 24px
- **Style:** Outline style for consistency
- **Color:** Inherit text color or use Primary Blue for actions

### Imagery
- **Placeholder Images:** Use subtle gradients or illustrations
- **User Avatars:** Circular, with fallback initials
- **Email Attachments:** File type icons with names

### Animations and Transitions

#### Micro-interactions
- Button hover: 150ms transition
- Card hover: 200ms transition
- Modal open/close: 200ms fade + slide
- Loading states: Skeleton screens or spinners

#### Page Transitions
- Smooth page transitions (Next.js built-in)
- Loading indicators for async operations
- Optimistic UI updates where appropriate

### Error States

#### Error Messages
- **Color:** Error Red
- **Icon:** Error icon (X or alert)
- **Location:** Below input or in toast notification
- **Message:** Clear, actionable error text

#### Empty States
- **Illustration:** Simple, friendly illustration
- **Message:** Helpful guidance
- **Action:** Primary action button if applicable

#### Loading States
- **Skeleton Screens:** For content loading
- **Spinners:** For actions/operations
- **Progress Bars:** For long operations

## Component Library Organization

### Component Categories

1. **Layout Components**
   - Header, Sidebar, Footer, Container, Grid

2. **Navigation Components**
   - NavLink, Breadcrumbs, Tabs, Pagination

3. **Form Components**
   - Input, Textarea, Select, Checkbox, Radio, DatePicker

4. **Data Display Components**
   - Card, Table, List, Timeline, Badge, Avatar

5. **Feedback Components**
   - Alert, Toast, Modal, Dialog, Loading, Skeleton

6. **Action Components**
   - Button, IconButton, Dropdown, Menu

7. **Email-Specific Components**
   - EmailCard, EmailDetail, ClientConversation, InternalNotes, NoteEditor

8. **Admin Components**
   - IncomingMailReview, ProjectManager, RoleManager, UserManager

## User Journey Maps

### Super User Journey

1. **Login** → See all projects + Admin area
2. **Incoming Mail Review** → Review unassigned/spam emails
3. **Assign Emails** → Route emails to correct projects
4. **Manage Projects** → Create/edit projects, configure AI routing
5. **Manage Roles** → Define permissions and roles
6. **Monitor System** → Check routing accuracy, spam detection

### Project Manager Journey

1. **Login** → See assigned projects
2. **Project View** → See all project emails
3. **Review New Email** → Read client communication
4. **Add Internal Note** → Provide context/instructions
5. **Assign Email** → Route to team member or role
6. **Monitor Progress** → Track email statuses
7. **Escalate** → Escalate complex issues to Super User

### Developer/Tester Journey

1. **Login** → See assigned projects
2. **Project View** → See only assigned emails
3. **Open Assigned Email** → Read client request
4. **Add Internal Note** → Ask questions, provide updates
5. **Update Status** → Mark as In Progress, Waiting, or Closed
6. **Collaborate** → Use @mentions to communicate with team

## Wireframe References

### Key Screens to Design

1. **Login Screen**
   - Centered form
   - Branding
   - Error states

2. **Dashboard**
   - Project grid
   - Stats overview
   - Quick actions

3. **Project View**
   - Header with project info
   - Filters bar
   - Tabs (Emails, Files & Links)
   - Timeline list

4. **Email Detail**
   - Client conversation panel
   - Internal notes panel
   - Action buttons
   - Assignment panel

5. **Incoming Mail Review**
   - Email list/table
   - Filters
   - Bulk actions
   - AI suggestion display

6. **Admin Pages**
   - Projects management
   - Roles management
   - Users management

## Design Tool Integration

### Recommended Tools
- **Figma** - For design mockups and prototypes
- **Storybook** - For component documentation and testing
- **Design Tokens** - For consistent styling across platforms

### Design Handoff
- Export assets from design tool
- Provide design specifications (spacing, colors, typography)
- Share component library in design tool
- Maintain design system documentation

## Notes

- All UI components should be built with accessibility in mind from the start
- Use consistent spacing and typography throughout
- Maintain visual hierarchy to guide user attention
- Ensure all interactive elements have clear hover and focus states
- Test designs with real content (not lorem ipsum) to ensure they work in practice
- Consider dark mode as a future enhancement (not in MVP)
- Mobile-first approach recommended for responsive design

