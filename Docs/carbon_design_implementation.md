# Carbon Design System Implementation Guide

## Overview

This document provides a comprehensive guide for implementing IBM's Carbon Design System in the Threadbox application. Carbon Design System is IBM's open-source design system that provides a collection of reusable components, design tools, and guidelines for building consistent, accessible user interfaces.

**Reference:** [Carbon Design System](https://carbondesignsystem.com/)

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Project Structure](#project-structure)
3. [Core Components Setup](#core-components-setup)
4. [Layout Components](#layout-components)
5. [Sidebar Navigation](#sidebar-navigation)
6. [Component Migration Guide](#component-migration-guide)
7. [Theming & Customization](#theming--customization)
8. [Accessibility](#accessibility)
9. [Best Practices](#best-practices)
10. [Migration Roadmap](#migration-roadmap)

---

## Installation & Setup

### Step 1: Install Carbon React Components

```bash
cd frontend
npm install @carbon/react @carbon/icons-react
```

### Step 2: Install Required Peer Dependencies

Carbon requires Sass for styling. Install Sass and related dependencies:

```bash
npm install sass
```

### Step 3: Install IBM Plex Fonts (Required)

Carbon Design System requires IBM Plex fonts. Install the font package:

```bash
npm install @ibm/plex
```

**Note:** This package is required for Carbon's font loading. Without it, you'll encounter font resolution errors.

### Step 4: Install Additional Carbon Packages (Optional but Recommended)

```bash
# For charts and data visualization
npm install @carbon/charts-react @carbon/charts
```

**Note:** 
- Date pickers are included in the main `@carbon/react` package. No separate date picker package is needed.
- Icons are already included in `@carbon/icons-react` from Step 1.

### Step 5: Update package.json

Your `package.json` should include:

```json
{
  "dependencies": {
    "@carbon/react": "^1.95.0",
    "@carbon/icons-react": "^11.70.0",
    "@ibm/plex": "^6.4.1",
    "sass": "^1.94.1"
  },
  "devDependencies": {
    "@carbon/charts-react": "^1.27.0",
    "@carbon/charts": "^1.27.0"
  }
}
```

**Note:** 
- Charts packages are optional and only needed if you plan to use data visualization components.
- `@ibm/plex` is required for Carbon's font system.

---

## Project Structure

### Recommended Folder Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with Carbon styles
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   └── ...
│   └── ...
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Carbon-based sidebar
│   │   ├── Header.tsx          # Carbon-based header
│   │   └── ContentLayout.tsx    # Main content wrapper
│   ├── carbon/                 # Carbon component wrappers
│   │   ├── CarbonButton.tsx
│   │   ├── CarbonCard.tsx
│   │   └── ...
│   └── ...
├── styles/
│   ├── carbon-theme.scss       # Carbon theme customization
│   └── globals.scss            # Global styles
└── lib/
    └── carbon/
        └── theme.ts            # Carbon theme configuration
```

---

## Core Components Setup

### Step 1: Configure Carbon Styles in Root Layout

Update `frontend/app/layout.tsx`:

**Important:** Carbon styles must be imported as SCSS in `layout.tsx`, not in `globals.css`. This is because `globals.css` is processed by Tailwind's PostCSS, which cannot handle SCSS imports.

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@carbon/react/index.scss"; // Import Carbon SCSS styles
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Threadbox",
  description: "Email management and project collaboration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Create Carbon Theme Configuration

Create `frontend/lib/carbon/theme.ts`:

```typescript
import { theme } from '@carbon/react';

// Carbon uses IBM Plex Sans by default
// You can customize the theme here if needed
export const carbonTheme = {
  // Custom theme tokens can be added here
  // See: https://carbondesignsystem.com/guidelines/themes/overview/
};

export default carbonTheme;
```

### Step 3: Update Global Styles

Update `frontend/app/globals.css` to work with Carbon:

**Note:** Carbon styles are imported in `layout.tsx`, not in `globals.css`. The `globals.css` file should only contain Tailwind imports and custom overrides.

```css
/* Import Tailwind (keep for backward compatibility during migration) */
@import "tailwindcss";

/* Custom overrides */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --font-geist-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* Ensure Carbon components use your font */
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans);
}

/* Custom utility classes */
.carbon-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### Step 4: Configure Next.js for Carbon

Create or update `frontend/next.config.ts` to handle Carbon's SCSS and font imports:

```typescript
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [
      path.join(process.cwd(), 'node_modules'),
      path.join(process.cwd(), 'node_modules/@carbon'),
    ],
    silenceDeprecations: ['import'],
    // Note: Custom importer removed - webpack's resolve.alias handles ~@ibm/plex imports
  },
  // Using webpack explicitly for Carbon SCSS compatibility
  // Turbopack has issues with Carbon's SCSS processing
  webpack: (config) => {
    // Resolve font files from @ibm/plex package
    // Handle both ~@ibm/plex and @ibm/plex imports
    // The ~ prefix is a webpack convention that resolves from node_modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '~@ibm/plex': path.join(process.cwd(), 'node_modules/@ibm/plex'),
    };
    
    // Configure webpack to handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });
    
    return config;
  },
};

export default nextConfig;
```

**Important:** Update `frontend/package.json` to use webpack explicitly:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Why this is needed:**
- Carbon's SCSS uses webpack-style `~` prefix for imports (e.g., `~@ibm/plex`)
- Webpack's `resolve.alias` handles the `~` prefix resolution before Sass processes the files
- The `~` prefix is a webpack convention that tells webpack to resolve from `node_modules`
- Font file handling rule allows webpack to process font assets correctly
- **Turbopack (Next.js 16 default) has compatibility issues with Carbon's SCSS**, so we must use webpack explicitly
- **Note:** We don't use a custom Sass importer because Next.js's sass-loader processes the `~` prefix through webpack's resolve system

---

## Layout Components

### Sidebar Navigation Component

Create `frontend/components/layout/Sidebar.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from '@carbon/react';
import {
  Dashboard,
  Folder,
  User,
  Settings,
  Mail,
  Users,
  FolderShared,
  Security,
} from '@carbon/icons-react';
import { useAuthStore } from '@/lib/store/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  children?: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSuperUser = user?.globalRole === 'super_user';

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Dashboard,
    },
    {
      label: 'Projects',
      href: '/dashboard',
      icon: Folder,
    },
  ];

  // Add admin items for super users
  if (isSuperUser) {
    navItems.push({
      label: 'Admin',
      href: '/admin',
      icon: Settings,
      children: [
        {
          label: 'Email Ingestion',
          href: '/admin/email-ingestion',
          icon: Mail,
        },
        {
          label: 'Incoming Review',
          href: '/admin/incoming-review',
          icon: Mail,
        },
        {
          label: 'Projects',
          href: '/admin/projects',
          icon: FolderShared,
        },
        {
          label: 'Users',
          href: '/admin/users',
          icon: Users,
        },
        {
          label: 'Roles',
          href: '/admin/roles',
          icon: Security,
        },
        {
          label: 'Memberships',
          href: '/admin/memberships',
          icon: Users,
        },
      ],
    });
  }

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <SideNav
      aria-label="Side navigation"
      expanded={isExpanded}
      onOverlayClick={() => setIsExpanded(false)}
      isRail
    >
      <SideNavItems>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          if (item.children) {
            return (
              <SideNavMenu key={item.href} title={item.label} renderIcon={Icon}>
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                  
                  return (
                    <SideNavMenuItem
                      key={child.href}
                      href={child.href}
                      isActive={isChildActive}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(child.href);
                      }}
                    >
                      {child.label}
                    </SideNavMenuItem>
                  );
                })}
              </SideNavMenu>
            );
          }

          return (
            <SideNavLink
              key={item.href}
              href={item.href}
              renderIcon={Icon}
              isActive={isActive}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.href);
              }}
            >
              {item.label}
            </SideNavLink>
          );
        })}
      </SideNavItems>
    </SideNav>
  );
}
```

### Header Component

Create `frontend/components/layout/Header.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  HeaderPanelLink,
} from '@carbon/react';
import {
  User,
  Notification,
  Logout,
  Menu,
} from '@carbon/icons-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useState } from 'react';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <CarbonHeader aria-label="Threadbox">
      <Menu
        size={20}
        onClick={onMenuClick}
        className="header-menu-button"
        style={{ cursor: 'pointer', marginLeft: '1rem' }}
      />
      <HeaderName href="/dashboard" prefix="Threadbox">
        [Platform]
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label="Notifications"
          tooltipAlignment="end"
        >
          <Notification size={20} />
        </HeaderGlobalAction>
        <HeaderGlobalAction
          aria-label="User"
          tooltipAlignment="end"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <User size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>
      {showUserMenu && (
        <HeaderPanel aria-label="User menu" expanded>
          <HeaderPanelLink href="#profile">
            Profile
          </HeaderPanelLink>
          <HeaderPanelLink href="#settings">
            Settings
          </HeaderPanelLink>
          <HeaderPanelLink onClick={handleLogout}>
            Logout
          </HeaderPanelLink>
        </HeaderPanel>
      )}
    </CarbonHeader>
  );
}
```

### Content Layout Component

Create `frontend/components/layout/ContentLayout.tsx`:

```typescript
'use client';

import { ReactNode } from 'react';
import { Content } from '@carbon/react';

interface ContentLayoutProps {
  children: ReactNode;
}

export default function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <Content className="main-content">
      <div className="carbon-container" style={{ padding: '2rem 1rem' }}>
        {children}
      </div>
    </Content>
  );
}
```

### Updated Dashboard Layout

Update `frontend/app/(dashboard)/layout.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import styles from './dashboard-layout.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.dashboardLayout}>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className={styles.dashboardContent}>
        <Sidebar />
        <ContentLayout>{children}</ContentLayout>
      </div>
    </div>
  );
}
```

Create `frontend/app/(dashboard)/dashboard-layout.module.scss`:

```scss
.dashboardLayout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.dashboardContent {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.mainContent {
  flex: 1;
  overflow-y: auto;
  background-color: var(--cds-layer-01);
}
```

---

## Component Migration Guide

### Buttons

**Before (Tailwind):**
```tsx
<button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
  Click me
</button>
```

**After (Carbon):**
```tsx
import { Button } from '@carbon/react';

<Button kind="primary">Click me</Button>
<Button kind="secondary">Cancel</Button>
<Button kind="danger">Delete</Button>
<Button kind="ghost">Ghost</Button>
```

### Cards

**Before:**
```tsx
<div className="rounded-lg bg-white p-6 shadow">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

**After:**
```tsx
import { Tile } from '@carbon/react';

<Tile>
  <h3>Card Title</h3>
  <p>Card content</p>
</Tile>
```

### Forms

**Before:**
```tsx
<input
  type="text"
  className="rounded-md border border-gray-300 px-3 py-2"
  placeholder="Enter text"
/>
```

**After:**
```tsx
import { TextInput, TextInputSkeleton } from '@carbon/react';

<TextInput
  id="text-input"
  labelText="Label"
  placeholder="Enter text"
  helperText="Optional helper text"
/>

// With validation
<TextInput
  id="text-input"
  labelText="Email"
  type="email"
  invalid={hasError}
  invalidText="Please enter a valid email"
/>
```

### Select/Dropdown

**Before:**
```tsx
<select className="rounded-md border border-gray-300 px-3 py-2">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**After:**
```tsx
import { Select, SelectItem } from '@carbon/react';

<Select id="select" labelText="Select an option">
  <SelectItem value="option1" text="Option 1" />
  <SelectItem value="option2" text="Option 2" />
</Select>
```

### Tables

**Before:**
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John Doe</td>
      <td>john@example.com</td>
    </tr>
  </tbody>
</table>
```

**After:**
```tsx
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';

<DataTable rows={rows} headers={headers}>
  {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => (
    <TableContainer title="DataTable">
      <Table {...getTableProps()}>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableHeader {...getHeaderProps({ header })}>
                {header.header}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow {...getRowProps({ row })}>
              {row.cells.map((cell) => (
                <TableCell key={cell.id}>{cell.value}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</DataTable>
```

### Modals/Dialogs

**Before:**
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="w-full max-w-2xl rounded-lg bg-white p-6">
    <h3>Modal Title</h3>
    <p>Modal content</p>
  </div>
</div>
```

**After:**
```tsx
import { Modal } from '@carbon/react';

<Modal
  open={isOpen}
  modalHeading="Modal Title"
  primaryButtonText="Save"
  secondaryButtonText="Cancel"
  onRequestClose={() => setIsOpen(false)}
  onRequestSubmit={handleSubmit}
>
  <p>Modal content</p>
</Modal>
```

### Tabs

**Before:**
```tsx
<div className="flex space-x-4 border-b">
  <button className="border-b-2 border-blue-500">Tab 1</button>
  <button>Tab 2</button>
</div>
```

**After:**
```tsx
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';

<Tabs>
  <TabList aria-label="Tab list">
    <Tab>Tab 1</Tab>
    <Tab>Tab 2</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Content 1</TabPanel>
    <TabPanel>Content 2</TabPanel>
  </TabPanels>
</Tabs>
```

### Loading States

**Before:**
```tsx
<div className="text-center py-12">
  <p>Loading...</p>
</div>
```

**After:**
```tsx
import { Loading } from '@carbon/react';

<Loading description="Loading data" withOverlay={false} />

// Or skeleton loaders
import { SkeletonText, SkeletonPlaceholder } from '@carbon/react';

<SkeletonPlaceholder />
<SkeletonText heading />
```

### Notifications/Toasts

**Before:**
```tsx
<div className="rounded-md bg-green-50 p-4">
  <p className="text-sm text-green-800">Success message</p>
</div>
```

**After:**
```tsx
import { ToastNotification, InlineNotification } from '@carbon/react';

<ToastNotification
  kind="success"
  title="Success"
  subtitle="Operation completed successfully"
  timeout={5000}
/>

<InlineNotification
  kind="error"
  title="Error"
  subtitle="Something went wrong"
/>
```

### Date Pickers

**Note:** Date pickers are included in `@carbon/react`. No separate package needed.

**Before:**
```tsx
<input
  type="date"
  className="rounded-md border border-gray-300 px-3 py-2"
/>
```

**After:**
```tsx
import { DatePicker, DatePickerInput } from '@carbon/react';

<DatePicker datePickerType="single">
  <DatePickerInput
    id="date-picker"
    placeholder="mm/dd/yyyy"
    labelText="Date"
    type="text"
  />
</DatePicker>

// For date range
<DatePicker datePickerType="range">
  <DatePickerInput
    id="date-picker-start"
    placeholder="mm/dd/yyyy"
    labelText="Start date"
    type="text"
  />
  <DatePickerInput
    id="date-picker-end"
    placeholder="mm/dd/yyyy"
    labelText="End date"
    type="text"
  />
</DatePicker>
```

---

## Theming & Customization

### Custom Theme Variables

Create `frontend/styles/carbon-theme.scss`:

```scss
// Override Carbon theme tokens
@use '@carbon/react/scss/theme' as *;

// Custom color tokens
$custom-primary: #2563eb;
$custom-secondary: #10b981;

// Apply custom theme
:root {
  --cds-interactive-01: #{$custom-primary};
  --cds-interactive-02: #{$custom-secondary};
  // Add more custom tokens as needed
}
```

### Using Custom Colors

```typescript
import { theme } from '@carbon/react';

// Access theme tokens in JavaScript
const primaryColor = theme.interactive01;
const secondaryColor = theme.interactive02;
```

---

## Accessibility

Carbon Design System is built with accessibility in mind and follows WCAG 2.1 Level AA standards. Key features:

1. **Keyboard Navigation**: All components support full keyboard navigation
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Focus Management**: Clear focus indicators and logical tab order
4. **Color Contrast**: Meets WCAG contrast requirements

### Best Practices

- Always provide `labelText` for form inputs
- Use `aria-label` for icon-only buttons
- Ensure proper heading hierarchy
- Test with keyboard navigation
- Test with screen readers

---

## Best Practices

### 1. Component Composition

Use Carbon components as building blocks:

```tsx
import { Stack, Button, TextInput } from '@carbon/react';

<Stack gap={4}>
  <TextInput id="email" labelText="Email" />
  <Button kind="primary">Submit</Button>
</Stack>
```

### 2. Icons

Always use Carbon icons for consistency:

```tsx
import { Add, Edit, Delete } from '@carbon/icons-react';

<Button renderIcon={Add}>Add Item</Button>
```

### 3. Spacing

Use Carbon's spacing system:

```tsx
import { Stack, Grid, Column } from '@carbon/react';

<Stack gap={6}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

<Grid>
  <Column lg={8} md={4} sm={4}>
    Content
  </Column>
</Grid>
```

### 4. Responsive Design

Carbon's Grid system handles responsiveness:

```tsx
<Grid>
  <Column lg={12} md={8} sm={4}>
    {/* Content adapts to screen size */}
  </Column>
</Grid>
```

---

## Migration Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install Carbon dependencies
- [ ] Set up theme configuration
- [ ] Create layout components (Sidebar, Header, ContentLayout)
- [ ] Update root layout with Carbon styles
- [ ] Test basic components

### Phase 2: Core Pages (Week 2)
- [ ] Migrate Dashboard page
- [ ] Migrate Login page
- [ ] Migrate Project View page
- [ ] Update navigation

### Phase 3: Admin Pages (Week 3)
- [ ] Migrate Admin dashboard
- [ ] Migrate Email Ingestion page
- [ ] Migrate Incoming Review page
- [ ] Migrate Users/Roles/Projects management pages

### Phase 4: Advanced Components (Week 4)
- [ ] Implement DataTables for lists
- [ ] Add advanced form components
- [ ] Implement modals and dialogs
- [ ] Add loading states and skeletons

### Phase 5: Polish & Testing (Week 5)
- [ ] Accessibility audit
- [ ] Responsive design testing
- [ ] Performance optimization
- [ ] User acceptance testing

---

## Additional Resources

- **Carbon Design System Documentation**: https://carbondesignsystem.com/
- **Carbon React Components**: https://react.carbondesignsystem.com/
- **Carbon Icons**: https://carbondesignsystem.com/elements/icons/library/
- **Carbon Storybook**: https://react.carbondesignsystem.com/?path=/story/getting-started-welcome--welcome
- **Carbon GitHub**: https://github.com/carbon-design-system/carbon

---

## Troubleshooting

### Common Issues

1. **Styles not loading**: 
   - Ensure `@carbon/react/index.scss` is imported in `layout.tsx` (not in `globals.css`)
   - Verify `sass` package is installed
   - Check that `next.config.ts` has proper `sassOptions` configuration

2. **Font resolution errors** (e.g., "Can't resolve '~@ibm/plex/...'"):
   - Install `@ibm/plex` package: `npm install @ibm/plex`
   - Ensure `next.config.ts` has the Sass importer and webpack alias configured (see Step 4)
   - Restart the dev server after configuration changes

3. **Icons not showing**: 
   - Verify `@carbon/icons-react` is installed
   - Check that icons are imported correctly: `import { IconName } from '@carbon/icons-react'`

4. **SCSS import errors in globals.css**:
   - **Do NOT** import Carbon styles in `globals.css`
   - Carbon styles must be imported in `layout.tsx` as SCSS
   - `globals.css` is processed by Tailwind's PostCSS, which cannot handle SCSS

5. **Build errors**: 
   - Ensure all dependencies are installed: `@carbon/react`, `@carbon/icons-react`, `@ibm/plex`, `sass`
   - Verify `next.config.ts` is properly configured
   - Clear `.next` cache and restart: `rm -rf .next && npm run dev`

6. **Turbopack errors** (e.g., "Failed to write app endpoint", "failed to deserialize message", "missing field 'name'"):
   - **Root cause:** Turbopack (Next.js 16 default) has compatibility issues with Carbon's SCSS processing
   - **Solution:** Use webpack explicitly by adding `--webpack` flag to dev script
   - Update `package.json`: `"dev": "next dev --webpack"`
   - **Critical:** Stop the server completely (Ctrl+C) and restart to apply the change
   - The server must be fully restarted, not just auto-reloaded
   - After restart, you should see "Next.js 16.0.3 (webpack)" instead of "(Turbopack)"

7. **Sass importer error** (e.g., "type 'JSArray<dynamic>' is not a subtype of type 'JSImporter'"):
   - **Root cause:** Next.js's Sass loader doesn't support array-based importers in `sassOptions.importer`
   - **Solution:** Remove the custom `importer` array from `sassOptions` in `next.config.ts`
   - Webpack's `resolve.alias` configuration handles `~@ibm/plex` imports automatically
   - The `~` prefix is processed by webpack's resolve system before Sass sees it
   - **Note:** This error occurs when using webpack, not Turbopack

8. **"Element type is invalid" error** (e.g., "got: undefined", "forgot to export your component"):
   - **Root cause:** Incorrect import or usage of Carbon components
   - **Common issue:** Using `TextInput.PasswordInput` instead of importing `PasswordInput` separately
   - **Solution:** Import `PasswordInput` as a separate component from `@carbon/react`:
     ```typescript
     import { TextInput, PasswordInput } from '@carbon/react';
     // Use <PasswordInput /> not <TextInput.PasswordInput />
     ```
   - **Note:** In Carbon React v1.95+, `PasswordInput` is a separate component, not a property of `TextInput`

### Getting Help

- Check Carbon's GitHub issues: https://github.com/carbon-design-system/carbon/issues
- Join Carbon's Slack community
- Review Carbon's migration guides for specific components

---

## Next Steps

1. Review this documentation
2. Install Carbon dependencies
3. Start with Phase 1 of the migration roadmap
4. Test components in isolation before full migration
5. Gather feedback and iterate

---

**Last Updated**: November 2025
**Carbon Version**: ^1.95.0

