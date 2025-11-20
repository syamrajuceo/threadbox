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
  Settings,
  Email,
  UserMultiple,
  FolderShared,
  Security,
} from '@carbon/icons-react';
import { useAuthStore } from '@/lib/store/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children?: NavItem[];
}

interface SidebarProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isExpanded: controlledExpanded, onToggle }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [internalExpanded, setInternalExpanded] = useState(true);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const isSuperUser = user?.globalRole === 'super_user';

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Dashboard,
    },
    // Note: Projects link removed as it duplicates Dashboard
    // Projects are accessible from the Dashboard page
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
          icon: Email,
        },
        {
          label: 'Incoming Review',
          href: '/admin/incoming-review',
          icon: Email,
        },
        {
          label: 'Projects',
          href: '/admin/projects',
          icon: FolderShared,
        },
        {
          label: 'Users',
          href: '/admin/users',
          icon: UserMultiple,
        },
        {
          label: 'Roles',
          href: '/admin/roles',
          icon: Security,
        },
        {
          label: 'Memberships',
          href: '/admin/memberships',
          icon: UserMultiple,
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
      onOverlayClick={handleToggle}
      isRail
    >
      <SideNavItems>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          // Use label as key to ensure uniqueness (label is unique per nav item)
          const uniqueKey = item.children ? `menu-${item.label}` : `link-${item.label}`;

          if (item.children) {
            return (
              <SideNavMenu key={uniqueKey} title={item.label} renderIcon={Icon}>
                {item.children.map((child) => {
                  const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/');
                  
                  return (
                    <SideNavMenuItem
                      key={child.href}
                      href={child.href}
                      isActive={isChildActive}
                      onClick={(e: React.MouseEvent) => {
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
              key={uniqueKey}
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

