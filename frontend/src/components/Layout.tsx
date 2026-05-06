'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { useAuthStore } from '@/context/auth';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function Layout({ children, requireAuth = true }: LayoutProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {isAuthenticated && <Navbar />}
      <main className="flex-1 overflow-auto">
        {isAuthenticated && <div className="bg-white border-b border-gray-200 px-8 py-4"></div>}
        <div className={isAuthenticated ? 'p-8' : ''}>{children}</div>
      </main>
    </div>
  );
}
