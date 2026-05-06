'use client';

import React from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  UsersIcon,
  CalendarIcon,
  DollarIcon,
  TrendUpIcon,
  TrendDownIcon,
  CheckCircleIcon,
  ClockIcon,
  SparkleIcon,
  PlusIcon,
} from '@/components/Icons';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, change, trend, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
              {value}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                  trend === 'up'
                    ? 'text-success-700 bg-success-50'
                    : 'text-danger-700 bg-danger-50'
                }`}
              >
                {trend === 'up' ? (
                  <TrendUpIcon className="w-3 h-3" />
                ) : (
                  <TrendDownIcon className="w-3 h-3" />
                )}
                {change}
              </span>
              <span className="text-xs text-slate-500">vs. mês anterior</span>
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total de Clientes',
      value: '127',
      change: '+12%',
      trend: 'up' as const,
      icon: <UsersIcon />,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Agendamentos Hoje',
      value: '8',
      change: '+3',
      trend: 'up' as const,
      icon: <CalendarIcon />,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Receita do Mês',
      value: 'R$ 24.580',
      change: '+18.2%',
      trend: 'up' as const,
      icon: <DollarIcon />,
      iconBg: 'bg-success-50',
      iconColor: 'text-success-600',
    },
    {
      title: 'Taxa de Satisfação',
      value: '94%',
      change: '-2%',
      trend: 'down' as const,
      icon: <SparkleIcon />,
      iconBg: 'bg-warning-50',
      iconColor: 'text-warning-600',
    },
  ];

  const recentActivity = [
    {
      type: 'service',
      title: 'Serviço completado',
      description: 'Lavagem completa - Honda Civic ABC-1234',
      time: '5 min atrás',
      status: 'success',
    },
    {
      type: 'customer',
      title: 'Novo cliente cadastrado',
      description: 'Maria Silva foi adicionada ao sistema',
      time: '1h atrás',
      status: 'primary',
    },
    {
      type: 'schedule',
      title: 'Agendamento confirmado',
      description: 'Toyota Corolla - Amanhã às 14:00',
      time: '2h atrás',
      status: 'info',
    },
    {
      type: 'service',
      title: 'Em andamento',
      description: 'Polimento - Volkswagen Gol XYZ-9876',
      time: '3h atrás',
      status: 'warning',
    },
  ];

  const upcomingSchedules = [
    {
      time: '09:00',
      client: 'João Pedro',
      service: 'Lavagem Completa',
      vehicle: 'Honda HR-V',
    },
    {
      time: '10:30',
      client: 'Ana Costa',
      service: 'Polimento',
      vehicle: 'Toyota Corolla',
    },
    {
      time: '14:00',
      client: 'Carlos Mendes',
      service: 'Estética Completa',
      vehicle: 'BMW X3',
    },
    {
      time: '16:00',
      client: 'Laura Santos',
      service: 'Lavagem Express',
      vehicle: 'Fiat Mobi',
    },
  ];

  return (
    <Layout requireAuth>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Aqui está o resumo do seu negócio hoje</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/customers">
              <Button variant="secondary" size="md" leftIcon={<UsersIcon className="w-4 h-4" />}>
                Ver Clientes
              </Button>
            </Link>
            <Button variant="primary" size="md" leftIcon={<PlusIcon className="w-4 h-4" />}>
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Activity - 2 cols */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Atividade Recente</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Últimas ações no sistema</p>
                </div>
                <Button variant="ghost" size="sm">
                  Ver tudo
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        activity.status === 'success'
                          ? 'bg-success-50 text-success-600'
                          : activity.status === 'warning'
                          ? 'bg-warning-50 text-warning-600'
                          : activity.status === 'primary'
                          ? 'bg-primary-50 text-primary-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {activity.status === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : activity.status === 'warning' ? (
                        <ClockIcon className="w-4 h-4" />
                      ) : activity.status === 'primary' ? (
                        <UsersIcon className="w-4 h-4" />
                      ) : (
                        <CalendarIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5 truncate">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Upcoming Schedules - 1 col */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Agenda do Dia</h2>
                  <p className="text-xs text-slate-500 mt-0.5">4 agendamentos</p>
                </div>
                <Badge variant="primary" dot>
                  Hoje
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingSchedules.map((schedule, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="text-center shrink-0">
                        <p className="text-sm font-bold text-primary-600 tabular-nums">
                          {schedule.time}
                        </p>
                      </div>
                      <div className="w-px self-stretch bg-slate-200" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {schedule.client}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {schedule.service}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {schedule.vehicle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-slate-900">Resumo Semanal</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Serviços realizados</span>
                  <span className="text-sm font-semibold text-slate-900">42</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-primary-500 rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Novos clientes</span>
                  <span className="text-sm font-semibold text-slate-900">12</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[45%] bg-success-500 rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Taxa de retorno</span>
                  <span className="text-sm font-semibold text-slate-900">68%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-warning-500 rounded-full" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Welcome / Getting Started */}
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 border-0 text-white overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <CardBody className="relative">
              <div className="flex items-center gap-2 mb-3">
                <SparkleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Sistema atualizado</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pronto para crescer?</h3>
              <p className="text-sm text-primary-100 mb-5 leading-relaxed">
                Explore os módulos disponíveis e comece a gerenciar seu negócio
                com mais eficiência.
              </p>
              <div className="flex gap-2">
                <Link href="/customers">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="!bg-white !text-primary-700 hover:!bg-primary-50"
                  >
                    Ver Clientes
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-white hover:!bg-white/10"
                >
                  Ver Tutorial
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
