'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { TopBar } from './TopBar';
import { useAuthStore } from '@/context/auth';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

const pageTitles: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Visão geral do seu negócio' },
  '/customers': { title: 'Clientes', description: 'Gerencie sua base de clientes' },
  '/vehicles': { title: 'Veículos', description: 'Cadastro de veículos dos clientes' },
  '/services': { title: 'Serviços', description: 'Catálogo de serviços oferecidos' },
  '/schedules': { title: 'Agendamentos', description: 'Agenda e ordens de serviço' },
  '/orders': { title: 'Pedidos', description: 'Ordens de serviço com itens e cobrança' },
  '/products': { title: 'Produtos', description: 'Estoque e produtos' },
  '/reports': { title: 'Relatórios', description: 'Análises e relatórios' },
  '/settings': { title: 'Configurações', description: 'Preferências do sistema' },
};

export function Layout({
  children,
  requireAuth = true,
  pageTitle,
  pageDescription,
}: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  const pageInfo = pathname ? pageTitles[pathname] : null;
  const finalTitle = pageTitle || pageInfo?.title || '';
  const finalDescription = pageDescription || pageInfo?.description || '';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'flex-1 ml-64' : 'flex-1'}>
        {isAuthenticated && <TopBar title={finalTitle} description={finalDescription} />}
        <div className={isAuthenticated ? 'p-8 max-w-[1600px] mx-auto' : ''}>{children}</div>
      </main>
    </div>
  );
}
