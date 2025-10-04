// src/components/layout/PageLayout.tsx
'use client';

import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import Navbar from '@/app/components/navbar';
import { styles } from '@/styles/components';

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  title?: string;
  description?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showNavbar = true,
  title,
  description,
}) => {
  const { getPadding } = useResponsive();

  return (
    <div>
      {showNavbar && <Navbar />}
      <div
        style={{
          ...styles.page,
          padding: getPadding('1rem', '1.5rem', '2rem'),
        }}
      >
        <div style={styles.container}>
          {title && (
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={styles.heading.h1}>{title}</h1>
              {description && (
                <p style={styles.text.muted}>{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};