'use client';

import { useRouter } from 'next/navigation';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  HeaderMenuItem,
} from '@carbon/react';
import {
  User,
  Notification,
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
          <HeaderMenuItem href="#profile">
            Profile
          </HeaderMenuItem>
          <HeaderMenuItem href="#settings">
            Settings
          </HeaderMenuItem>
          <HeaderMenuItem onClick={handleLogout}>
            Logout
          </HeaderMenuItem>
        </HeaderPanel>
      )}
    </CarbonHeader>
  );
}

