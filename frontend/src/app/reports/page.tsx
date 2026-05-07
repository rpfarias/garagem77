'use client';

import React from 'react';
import {
  DashboardSummary,
  RecentScheduleItem,
  TopServiceItem,
  ScheduleStatus,
} from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { Layout } from '@/components/Layout';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import {
  UsersIcon,
  CarIcon,
  WrenchIcon,
  PackageIcon,
  CalendarIcon,
  DollarIcon,
  TrendUpIcon,
  TrendDownIcon,
  ChartIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@/components/Icons';
import clsx from 'clsx';

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_VARIANT: Record<
  ScheduleStatus,
  'primary' | 'warning' | 'success' | 'default'
> = {
  SCHEDULED: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const STATUS_BAR: Record<ScheduleStatus, string> = {
  SCHEDULED: 'bg-primary-500',
  IN_PROGRESS: 'bg-warning-500',
  COMPLETED: 'bg-success-500',
  CANCELLED: 'bg-slate-400',
};

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; up: boolean };
}

function KPICard({ title, value, subtitle, icon, iconBg, iconColor, trend }: KPICardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
            <div className={iconColor}>{icon}</div>
          </div>
          {trend && (
            <span
              className={clsx(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                trend.up ? 'text-success-700 bg-success-50' : 'text-danger-700 bg-danger-50'
              )}
            >
              {trend.up ? (
                <TrendUpIcon className="w-3 h-3" />
              ) : (
                <TrendDownIcon className="w-3 h-3" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
          {value}
        </p>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </CardBody>
    </Card>
  );
}

function formatPrice(price?: number) {
  if (price == null) return '-';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function ReportsPage() {
  const { data: summary, isLoading: loadingSummary } =
    useFetch<DashboardSummary>('/reports/dashboard');
  const { data: recent, isLoading: loadingRecent } =
    useFetch<RecentScheduleItem[]>('/reports/recent-schedules?limit=8');
  const { data: top, isLoading: loadingTop } =
    useFetch<TopServiceItem[]>('/reports/top-services?limit=5');

  const totalSchedules = summary?.totalSchedules ?? 0;
  const statusCounts = summary?.schedulesByStatus ?? {};

  const statusKeys: ScheduleStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard
            title="Clientes"
            value={loadingSummary ? '...' : summary?.totalCustomers ?? 0}
            icon={<UsersIcon />}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
          />
          <KPICard
            title="Veículos"
            value={loadingSummary ? '...' : summary?.totalVehicles ?? 0}
            icon={<CarIcon />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KPICard
            title="Serviços ativos"
            value={loadingSummary ? '...' : summary?.totalServices ?? 0}
            subtitle={
              summary && summary.averageServicePrice > 0
                ? `Preço médio: ${formatPrice(Number(summary.averageServicePrice))}`
                : undefined
            }
            icon={<WrenchIcon />}
            iconBg="bg-success-50"
            iconColor="text-success-600"
          />
          <KPICard
            title="Produtos no estoque"
            value={loadingSummary ? '...' : summary?.totalProducts ?? 0}
            subtitle={
              summary
                ? `Valor: ${formatPrice(Number(summary.totalInventoryValue))}`
                : undefined
            }
            icon={<PackageIcon />}
            iconBg="bg-warning-50"
            iconColor="text-warning-600"
          />
        </div>

        {/* Inventory Alerts + Service Catalog */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Inventory Health */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Saúde do estoque
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alerta de produtos com baixa disponibilidade
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-warning-600" />
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {loadingSummary ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning-50/50 border border-warning-200/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center">
                        <TrendDownIcon className="w-4 h-4 text-warning-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Estoque baixo</p>
                        <p className="text-xs text-slate-500">qty ≤ mínimo, mas &gt; 0</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-warning-700 tabular-nums">
                      {summary?.lowStockCount ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-danger-50/50 border border-danger-200/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-danger-100 flex items-center justify-center">
                        <TrendDownIcon className="w-4 h-4 text-danger-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Sem estoque</p>
                        <p className="text-xs text-slate-500">qty = 0</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-danger-700 tabular-nums">
                      {summary?.outOfStockCount ?? 0}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Valor total em estoque</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {formatPrice(Number(summary?.totalInventoryValue ?? 0))}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Service Catalog Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Catálogo de serviços
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Faixas de preço dos serviços ativos
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                  <DollarIcon className="w-5 h-5 text-success-600" />
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {loadingSummary ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <p className="text-xs text-slate-500 mb-1">Mínimo</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatPrice(Number(summary?.minServicePrice ?? 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-primary-50 border border-primary-200/60">
                    <p className="text-xs text-primary-600 mb-1 font-medium">Médio</p>
                    <p className="text-lg font-bold text-primary-700 tabular-nums">
                      {formatPrice(Number(summary?.averageServicePrice ?? 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-200/60">
                    <p className="text-xs text-slate-500 mb-1">Máximo</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatPrice(Number(summary?.maxServicePrice ?? 0))}
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Schedules Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Distribuição de agendamentos
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalSchedules} {totalSchedules === 1 ? 'agendamento' : 'agendamentos'} no
                  total
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <ChartIcon className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loadingSummary ? (
              <p className="text-sm text-slate-500">Carregando...</p>
            ) : totalSchedules === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">
                  Nenhum agendamento ainda. Crie agendamentos para ver a distribuição aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Stacked bar */}
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  {statusKeys.map((status) => {
                    const count = statusCounts[status] ?? 0;
                    const pct = totalSchedules > 0 ? (count / totalSchedules) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={status}
                        className={STATUS_BAR[status]}
                        style={{ width: `${pct}%` }}
                        title={`${STATUS_LABELS[status]}: ${count}`}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {statusKeys.map((status) => {
                    const count = statusCounts[status] ?? 0;
                    const pct =
                      totalSchedules > 0
                        ? ((count / totalSchedules) * 100).toFixed(0)
                        : '0';
                    return (
                      <div
                        key={status}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200/60"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={clsx('w-2 h-2 rounded-full', STATUS_BAR[status])} />
                          <span className="text-xs font-medium text-slate-600">
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-slate-900 tabular-nums">
                            {count}
                          </span>
                          <span className="text-xs text-slate-500 mb-1">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Top Services + Recent Schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Top serviços
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Por número de agendamentos
                  </p>
                </div>
                <Badge variant="primary">Top 5</Badge>
              </div>
            </CardHeader>
            <CardBody className="!p-0">
              {loadingTop ? (
                <p className="text-sm text-slate-500 p-6">Carregando...</p>
              ) : !top || top.length === 0 ? (
                <div className="py-12 text-center">
                  <WrenchIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm text-slate-500 mt-2">
                    Sem dados — agendamentos ainda não realizados.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {top.map((svc, idx) => {
                    const maxBookings = Math.max(...top.map((s) => s.bookings));
                    const widthPct = maxBookings > 0 ? (svc.bookings / maxBookings) * 100 : 0;
                    return (
                      <div key={svc.id} className="px-6 py-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-slate-400 tabular-nums w-5">
                            #{idx + 1}
                          </span>
                          <p className="flex-1 font-medium text-slate-900 truncate">
                            {svc.name}
                          </p>
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {svc.bookings}
                          </span>
                        </div>
                        <div className="ml-8 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full transition-all"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums shrink-0">
                            {formatPrice(Number(svc.totalRevenue))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Schedules */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Atividade recente
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Últimos agendamentos
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            </CardHeader>
            <CardBody className="!p-0">
              {loadingRecent ? (
                <p className="text-sm text-slate-500 p-6">Carregando...</p>
              ) : !recent || recent.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm text-slate-500 mt-2">Nenhuma atividade recente.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recent.map((s) => {
                    const dt = new Date(s.scheduledAt);
                    return (
                      <div key={s.id} className="px-6 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xs font-bold text-primary-600">
                            {dt.toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                          <span className="text-xs font-bold text-primary-700 leading-none">
                            {dt.getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {s.serviceName || 'Serviço'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {s.customerName} {s.vehiclePlate && `• ${s.vehiclePlate}`}
                          </p>
                        </div>
                        <Badge variant={STATUS_VARIANT[s.status]}>
                          {STATUS_LABELS[s.status]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
