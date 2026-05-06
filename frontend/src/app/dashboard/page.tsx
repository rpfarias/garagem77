'use client';

import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Layout requireAuth={true}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.name || 'Usuário'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Aqui você pode gerenciar clientes, serviços, agendamentos e muito mais.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
              <p className="text-4xl font-bold text-primary-600 mt-2">--</p>
              <p className="text-xs text-gray-500 mt-2">Carregando...</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-gray-600 text-sm font-medium">Agendamentos Hoje</p>
              <p className="text-4xl font-bold text-primary-600 mt-2">--</p>
              <p className="text-xs text-gray-500 mt-2">Carregando...</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-gray-600 text-sm font-medium">Receita do Mês</p>
              <p className="text-4xl font-bold text-success-600 mt-2">R$ --</p>
              <p className="text-xs text-gray-500 mt-2">Carregando...</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center">
              <p className="text-gray-600 text-sm font-medium">Taxa de Satisfação</p>
              <p className="text-4xl font-bold text-success-600 mt-2">--%</p>
              <p className="text-xs text-gray-500 mt-2">Carregando...</p>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Atividade Recente</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  A integração da API está funcionando corretamente. Continue com a implementação
                  dos componentes específicos do negócio!
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Próximos Passos</h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Estrutura Next.js com TypeScript</li>
              <li>✅ Autenticação JWT com Zustand</li>
              <li>✅ Componentes UI base (Button, Input, Card)</li>
              <li>✅ Layout com Navbar</li>
              <li>📝 CRUD de Clientes</li>
              <li>📝 Gerenciamento de Agendamentos</li>
              <li>📝 Relatórios e Dashboards</li>
              <li>📝 Integração com Payment Gateway</li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
