'use client';

import React, { useState, useEffect } from 'react';
import { Schedule, ScheduleStatus, PaginatedResponse } from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  CarIcon,
} from '@/components/Icons';
import { ScheduleForm } from './components/ScheduleForm';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type StatusFilter = 'ALL' | ScheduleStatus;

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_VARIANT: Record<ScheduleStatus, 'primary' | 'warning' | 'success' | 'default'> = {
  SCHEDULED: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'SCHEDULED', label: 'Agendados' },
  { key: 'IN_PROGRESS', label: 'Em andamento' },
  { key: 'COMPLETED', label: 'Concluídos' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

export default function SchedulesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const url =
    statusFilter === 'ALL'
      ? `/schedules?page=${page}&size=10`
      : `/schedules?status=${statusFilter}&page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Schedule>>(url, [url]);

  const handleClose = () => {
    setIsCreateOpen(false);
    setEditing(null);
  };

  const handleSuccess = () => {
    handleClose();
    refetch();
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/schedules/${id}`);
      toast.success('Agendamento removido');
      setDeletingId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  // PATCH para mudar status do agendamento (apiClient não expõe PATCH)
  const patchAction = async (id: string, action: 'cancel' | 'in-progress' | 'complete') => {
    setActionId(id);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/schedules/${id}/${action}`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro');
      }
      const labels = {
        cancel: 'cancelado',
        'in-progress': 'iniciado',
        complete: 'concluído',
      };
      toast.success(`Agendamento ${labels[action]}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao alterar status');
    } finally {
      setActionId(null);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      year: d.getFullYear(),
    };
  };

  const formatPrice = (price?: number) =>
    price
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
      : '-';

  // Compute counts per status (visible page only — for visual accent)
  const statusCounts = data?.content?.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Action header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
            <Badge variant="default" size="md">
              {totalElements} {totalElements === 1 ? 'agendamento' : 'agendamentos'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Novo Agendamento
          </Button>
        </div>

        <Card>
          {/* Status Tabs */}
          <div className="px-5 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            <div className="flex gap-1 min-w-fit">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={clsx(
                      'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando agendamentos...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {statusFilter !== 'ALL'
                  ? `Nenhum agendamento ${STATUS_LABELS[statusFilter as ScheduleStatus].toLowerCase()}`
                  : 'Nenhum agendamento ainda'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {statusFilter !== 'ALL'
                  ? 'Quando houver agendamentos com este status, eles aparecerão aqui.'
                  : 'Crie seu primeiro agendamento ligando um cliente, veículo e serviço.'}
              </p>
              {statusFilter === 'ALL' && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Novo agendamento
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.content.map((schedule) => {
                  const dt = formatDateTime(schedule.scheduledAt);
                  const isCancellable =
                    schedule.status === 'SCHEDULED' || schedule.status === 'IN_PROGRESS';
                  const isStartable = schedule.status === 'SCHEDULED';
                  const isCompletable = schedule.status === 'IN_PROGRESS';
                  const isInAction = actionId === schedule.id;

                  return (
                    <div
                      key={schedule.id}
                      className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row lg:items-center gap-4"
                    >
                      {/* Date block */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/40 dark:to-primary-900/40 border border-primary-200/60 dark:border-primary-900/60 flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xs font-semibold text-primary-600 dark:text-primary-400 uppercase">
                            {dt.date.split(' ')[1]}
                          </span>
                          <span className="text-lg font-bold text-primary-700 dark:text-primary-300 tabular-nums leading-none">
                            {dt.date.split(' ')[0]}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                              {dt.time}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                            <Badge
                              variant={STATUS_VARIANT[schedule.status]}
                              dot
                            >
                              {STATUS_LABELS[schedule.status]}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {schedule.serviceName || 'Serviço'}
                            {schedule.servicePrice && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal ml-2">
                                {formatPrice(Number(schedule.servicePrice))}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="truncate">{schedule.customerName || 'Cliente'}</span>
                            {schedule.vehiclePlate && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <CarIcon className="w-3 h-3" />
                                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                                    {schedule.vehiclePlate}
                                  </span>
                                  {schedule.vehicleModel && (
                                    <span>({schedule.vehicleModel})</span>
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {schedule.notes && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic line-clamp-1">
                              "{schedule.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {deletingId === schedule.id ? (
                          <>
                            <p className="text-xs text-danger-700 dark:text-danger-300 mr-2">Excluir?</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingId(null)}
                              disabled={isDeleting}
                            >
                              Não
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleConfirmDelete(schedule.id)}
                              isLoading={isDeleting}
                            >
                              Sim
                            </Button>
                          </>
                        ) : (
                          <>
                            {isStartable && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => patchAction(schedule.id, 'in-progress')}
                                disabled={isInAction}
                                leftIcon={<ClockIcon className="w-3.5 h-3.5" />}
                              >
                                Iniciar
                              </Button>
                            )}
                            {isCompletable && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => patchAction(schedule.id, 'complete')}
                                disabled={isInAction}
                                leftIcon={<CheckCircleIcon className="w-3.5 h-3.5" />}
                              >
                                Concluir
                              </Button>
                            )}
                            {isCancellable && (
                              <button
                                onClick={() => patchAction(schedule.id, 'cancel')}
                                disabled={isInAction}
                                className="text-xs px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-danger-700 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors disabled:opacity-50"
                                title="Cancelar"
                              >
                                Cancelar
                              </button>
                            )}
                            {schedule.status === 'SCHEDULED' && (
                              <button
                                onClick={() => setEditing(schedule)}
                                className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                                title="Editar"
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingId(schedule.id)}
                              className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                              title="Remover"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Página <span className="font-medium text-slate-900 dark:text-slate-100">{currentPage}</span> de{' '}
                    <span className="font-medium text-slate-900 dark:text-slate-100">{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0 || isLoading}
                      leftIcon={<ChevronLeftIcon />}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1 || isLoading}
                      rightIcon={<ChevronRightIcon />}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isCreateOpen || !!editing}
        onClose={handleClose}
        title={editing ? 'Editar Agendamento' : 'Novo Agendamento'}
        description={
          editing
            ? 'Apenas data e observações podem ser alteradas'
            : 'Selecione cliente, veículo e serviço'
        }
        size="lg"
      >
        <ScheduleForm
          schedule={editing || undefined}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </Layout>
  );
}
