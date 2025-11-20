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
        <Sidebar isExpanded={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <ContentLayout>{children}</ContentLayout>
      </div>
    </div>
  );
}

