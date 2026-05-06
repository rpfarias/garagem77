'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';

export function Navbar() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">Garagem77</h1>
        <p className="text-sm text-gray-600">CRM para Lava Jato</p>
      </div>

      <ul className="mt-8 space-y-2">
        <li>
          <Link
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/customers"
            className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            Clientes
          </Link>
        </li>
        <li>
          <Link
            href="/services"
            className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            Serviços
          </Link>
        </li>
        <li>
          <Link
            href="/schedules"
            className="block px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
          >
            Agendamentos
          </Link>
        </li>
      </ul>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-primary-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{user?.name || 'Usuário'}</span>
          </p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button variant="ghost" size="md" onClick={handleLogout} fullWidth>
          Sair
        </Button>
      </div>
    </nav>
  );
}
