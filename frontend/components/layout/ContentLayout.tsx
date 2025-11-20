'use client';

import { ReactNode } from 'react';
import { Content } from '@carbon/react';

interface ContentLayoutProps {
  children: ReactNode;
}

export default function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <Content 
      className="main-content" 
      style={{ 
        height: '100%', 
        overflow: 'auto',
        backgroundColor: 'var(--cds-layer-01)'
      }}
    >
      <div className="carbon-container" style={{ padding: '2rem 1rem', minHeight: '100%' }}>
        {children}
      </div>
    </Content>
  );
}

