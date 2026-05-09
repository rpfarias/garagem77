'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PaginatedResponse } from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import {
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  CarIcon,
  WrenchIcon,
} from '@/components/Icons';
import { OrderForm } from './components/OrderForm';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type StatusFilter = 'ALL' | OrderStatus;

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

const STATUS_VARIANT: Record<OrderStatus, 'primary' | 'warning' | 'success' | 'default'> = {
  PENDING: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'IN_PROGRESS', label: 'Em andamento' },
  { key: 'COMPLETED', label: 'Concluídos' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const url =
    statusFilter === 'ALL'
      ? `/orders?page=${page}&size=10`
      : `/orders?status=${statusFilter}&page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Order>>(url, [url]);

  const handleSuccess = () => {
    setIsCreateOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/orders/${id}`);
      toast.success('Pedido removido');
      setDeletingId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  const patchStatus = async (id: string, action: 'in-progress' | 'complete' | 'cancel') => {
    setActionId(id);
    try {
      const token = localStorage.getItem('auth_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      let url: string;
      if (action === 'cancel') {
        url = `${apiBase}/orders/${id}/cancel`;
      } else {
        const status = action === 'in-progress' ? 'IN_PROGRESS' : 'COMPLETED';
        url = `${apiBase}/orders/${id}/status/${status}`;
      }
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro');
      }
      const labels = { 'in-progress': 'iniciado', complete: 'concluído', cancel: 'cancelado' };
      toast.success(`Pedido ${labels[action]}`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erro');
    } finally {
      setActionId(null);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const formatPrice = (n?: number) =>
    n != null
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
      : '-';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Aggregate stats from page
  const totalRevenue =
    data?.content
      ?.filter((o) => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + Number(o.finalAmount || 0), 0) || 0;

  const pendingCount = data?.content?.filter((o) => o.status === 'PENDING').length || 0;
  const completedCount = data?.content?.filter((o) => o.status === 'COMPLETED').length || 0;

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardBody className="!p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pendentes (página)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="!p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-success-950/40 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Concluídos (página)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {completedCount}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="!p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-warning-50 dark:bg-warning-950/40 flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receita realizada (página)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {formatPrice(totalRevenue)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Total</span>
            <Badge variant="default" size="md">
              {totalElements} {totalElements === 1 ? 'pedido' : 'pedidos'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Novo Pedido
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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando pedidos...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <PackageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {statusFilter !== 'ALL'
                  ? `Nenhum pedido ${STATUS_LABELS[statusFilter as OrderStatus].toLowerCase()}`
                  : 'Nenhum pedido cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {statusFilter !== 'ALL'
                  ? 'Quando houver pedidos com este status, eles aparecerão aqui.'
                  : 'Crie pedidos vinculando cliente, veículo e serviços/produtos.'}
              </p>
              {statusFilter === 'ALL' && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Criar primeiro pedido
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.content.map((order) => {
                  const isExpanded = expandedId === order.id;
                  const isInAction = actionId === order.id;
                  const canStart = order.status === 'PENDING';
                  const canComplete = order.status === 'IN_PROGRESS';
                  const canCancel =
                    order.status === 'PENDING' || order.status === 'IN_PROGRESS';

                  return (
                    <div key={order.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors">
                      <div
                        className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                          <PackageIcon className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <code className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              #{order.id.slice(0, 8)}
                            </code>
                            <Badge variant={STATUS_VARIANT[order.status]} dot>
                              {STATUS_LABELS[order.status]}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {order.customerName || 'Cliente'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {order.vehiclePlate && (
                              <span className="inline-flex items-center gap-1">
                                <CarIcon className="w-3 h-3" />
                                <span className="font-mono font-bold">
                                  {order.vehiclePlate}
                                </span>
                              </span>
                            )}
                            <span>•</span>
                            <span>{order.items?.length || 0} item(s)</span>
                            <span>•</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                            {formatPrice(Number(order.finalAmount || 0))}
                          </p>
                          {Number(order.discountAmount || 0) > 0 && (
                            <p className="text-xs text-success-600 dark:text-success-400">
                              -{formatPrice(Number(order.discountAmount))}
                            </p>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-3">
                          {/* Items */}
                          {order.items && order.items.length > 0 && (
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 divide-y divide-slate-200/60 dark:divide-slate-700/60">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="px-4 py-2.5 flex items-center gap-3"
                                >
                                  <div
                                    className={clsx(
                                      'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                                      item.serviceName
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                    )}
                                  >
                                    {item.serviceName ? (
                                      <WrenchIcon className="w-3.5 h-3.5" />
                                    ) : (
                                      <PackageIcon className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {item.serviceName || item.productName || 'Item'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {item.quantity}× {formatPrice(Number(item.unitPrice))}
                                    </p>
                                  </div>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                                    {formatPrice(Number(item.subtotal))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-2">
                            {order.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 italic flex-1 line-clamp-2">
                                "{order.notes}"
                              </p>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              {deletingId === order.id ? (
                                <>
                                  <span className="text-xs text-danger-700 dark:text-danger-300">
                                    Confirmar exclusão?
                                  </span>
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
                                    onClick={() => handleDelete(order.id)}
                                    isLoading={isDeleting}
                                  >
                                    Sim
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {canStart && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => patchStatus(order.id, 'in-progress')}
                                      disabled={isInAction}
                                      leftIcon={<ClockIcon className="w-3.5 h-3.5" />}
                                    >
                                      Iniciar
                                    </Button>
                                  )}
                                  {canComplete && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => patchStatus(order.id, 'complete')}
                                      disabled={isInAction}
                                      leftIcon={<CheckCircleIcon className="w-3.5 h-3.5" />}
                                    >
                                      Concluir
                                    </Button>
                                  )}
                                  {canCancel && (
                                    <button
                                      onClick={() => patchStatus(order.id, 'cancel')}
                                      disabled={isInAction}
                                      className="text-xs px-3 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-danger-700 dark:hover:text-danger-300 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setDeletingId(order.id)}
                                    className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                                    title="Remover"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Pedido"
        description="Crie um pedido com cliente, veículo e itens"
        size="xl"
      >
        <OrderForm onSuccess={handleSuccess} onCancel={() => setIsCreateOpen(false)} />
      </Modal>
    </Layout>
  );
}
