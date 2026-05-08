'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  UsersIcon,
  CarIcon,
  WrenchIcon,
  CalendarIcon,
  PackageIcon,
  ChartIcon,
  SparkleIcon,
  DollarIcon,
  SettingsIcon,
  LogoutIcon,
} from './Icons';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
  { href: '/customers', label: 'Clientes', icon: <UsersIcon /> },
  { href: '/vehicles', label: 'Veículos', icon: <CarIcon /> },
  { href: '/services', label: 'Serviços', icon: <WrenchIcon /> },
  { href: '/schedules', label: 'Agendamentos', icon: <CalendarIcon /> },
  { href: '/orders', label: 'Pedidos', icon: <PackageIcon /> },
  { href: '/payments', label: 'Pagamentos', icon: <DollarIcon /> },
  { href: '/products', label: 'Produtos', icon: <PackageIcon /> },
  { href: '/loyalty', label: 'Fidelidade', icon: <SparkleIcon /> },
  { href: '/reports', label: 'Relatórios', icon: <ChartIcon /> },
];

const bottomNavItems: NavItem[] = [
  { href: '/settings', label: 'Configurações', icon: <SettingsIcon /> },
];

export function Navbar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-screen fixed left-0 top-0 flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">Garagem77</h1>
            <p className="text-xs text-slate-500">CRM Profissional</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-1">
          <p className="px-3 mb-2 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </p>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <span
                      className={clsx(
                        'transition-colors',
                        isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-2xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6">
          <p className="px-3 mb-2 text-2xs font-semibold text-slate-400 uppercase tracking-wider">
            Sistema
          </p>
          <ul className="space-y-0.5">
            {bottomNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <span
                      className={clsx(
                        'transition-colors',
                        isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
            {getInitials(user?.name, user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.name || 'Administrador'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'admin@garagem77.com'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Sair"
          >
            <LogoutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
