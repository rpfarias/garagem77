'use client';

import React, { useState, useEffect } from 'react';
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  Order,
  CreatePaymentDTO,
  PaginatedResponse,
} from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import {
  PlusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DollarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendUpIcon,
  TrendDownIcon,
} from '@/components/Icons';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type StatusFilter = 'ALL' | PaymentStatus;

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluído',
  FAILED: 'Falhado',
  CANCELLED: 'Cancelado',
};

const STATUS_VARIANT: Record<PaymentStatus, 'primary' | 'success' | 'danger' | 'default'> = {
  PENDING: 'primary',
  COMPLETED: 'success',
  FAILED: 'danger',
  CANCELLED: 'default',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão Crédito',
  CARTAO_DEBITO: 'Cartão Débito',
};

const METHOD_ICON: Record<PaymentMethod, string> = {
  PIX: '⚡',
  DINHEIRO: '💵',
  CARTAO_CREDITO: '💳',
  CARTAO_DEBITO: '💳',
};

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'COMPLETED', label: 'Concluídos' },
  { key: 'FAILED', label: 'Falhados' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

// ============================================================================
// PAYMENT FORM
// ============================================================================

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [orderId, setOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load orders
  useEffect(() => {
    setLoadingOrders(true);
    apiClient
      .get<PaginatedResponse<Order>>('/orders?page=0&size=100')
      .then((data) => setOrders(data?.content || []))
      .catch(() => toast.error('Erro ao carregar pedidos'))
      .finally(() => setLoadingOrders(false));
  }, []);

  // Auto-fill amount when order changes
  useEffect(() => {
    if (orderId) {
      const order = orders.find((o) => o.id === orderId);
      if (order && Number(order.finalAmount) > 0) {
        setAmount(String(order.finalAmount));
      }
    }
  }, [orderId, orders]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!orderId) e.orderId = 'Selecione um pedido';
    if (!paymentMethod) e.paymentMethod = 'Selecione método';
    const n = parseFloat(amount.replace(',', '.'));
    if (isNaN(n) || n <= 0) e.amount = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dto: CreatePaymentDTO = {
        orderId,
        paymentMethod,
        amount: parseFloat(amount.replace(',', '.')),
      };
      await apiClient.post<Payment>('/payments', dto);
      toast.success('Pagamento registrado');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (n?: number) =>
    n != null
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
      : '-';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Pedido</label>
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          disabled={isLoading || loadingOrders}
          className={clsx(
            'w-full px-3.5 py-2.5 rounded-lg text-sm bg-white border shadow-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50',
            errors.orderId ? 'border-danger-300' : 'border-slate-200'
          )}
        >
          <option value="">{loadingOrders ? 'Carregando...' : 'Selecione um pedido'}</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              #{o.id.slice(0, 8)} — {o.customerName || 'Cliente'} —{' '}
              {formatPrice(Number(o.finalAmount))}
            </option>
          ))}
        </select>
        {errors.orderId && <span className="text-xs text-danger-600">{errors.orderId}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Método de pagamento</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPaymentMethod(m)}
              disabled={isLoading}
              className={clsx(
                'p-3 rounded-lg border text-sm font-medium transition-colors',
                paymentMethod === m
                  ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <div className="text-xl mb-0.5">{METHOD_ICON[m]}</div>
              <div className="text-xs">{METHOD_LABELS[m]}</div>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Valor"
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        disabled={isLoading}
        placeholder="0,00"
        leftIcon={<span className="text-slate-500 text-sm font-medium">R$</span>}
        helpText="Preenchido automaticamente com o total do pedido (editável)"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Registrar pagamento
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const url =
    statusFilter === 'ALL'
      ? `/payments?page=${page}&size=10`
      : `/payments?status=${statusFilter}&page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Payment>>(url, [url]);

  const handleSuccess = () => {
    setIsCreateOpen(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/payments/${id}`);
      toast.success('Pagamento removido');
      setDeletingId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  const patchAction = async (id: string, action: 'complete' | 'fail' | 'cancel') => {
    setActionId(id);
    try {
      const token = localStorage.getItem('auth_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const res = await fetch(`${apiBase}/payments/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro');
      }
      const labels = { complete: 'concluído', fail: 'marcado como falhado', cancel: 'cancelado' };
      toast.success(`Pagamento ${labels[action]}`);
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

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Stats from page
  const completedAmount =
    data?.content
      ?.filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const pendingAmount =
    data?.content
      ?.filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const completedCount = data?.content?.filter((p) => p.status === 'COMPLETED').length || 0;
  const pendingCount = data?.content?.filter((p) => p.status === 'PENDING').length || 0;

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-success-50 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Recebido (página) — {completedCount}
                </p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatPrice(completedAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Pendente (página) — {pendingCount}
                </p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatPrice(pendingAmount)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning-50 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total registros</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {totalElements}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total</span>
            <Badge variant="default" size="md">
              {totalElements} {totalElements === 1 ? 'pagamento' : 'pagamentos'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Novo Pagamento
          </Button>
        </div>

        <Card>
          {/* Status Tabs */}
          <div className="px-5 pt-3 border-b border-slate-100 overflow-x-auto">
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
                        ? 'border-primary-600 text-primary-700'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
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
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Carregando pagamentos...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <DollarIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {statusFilter !== 'ALL'
                  ? `Nenhum pagamento ${STATUS_LABELS[statusFilter as PaymentStatus].toLowerCase()}`
                  : 'Nenhum pagamento registrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {statusFilter !== 'ALL'
                  ? 'Quando houver pagamentos com este status, eles aparecerão aqui.'
                  : 'Registre o primeiro pagamento vinculando-o a um pedido existente.'}
              </p>
              {statusFilter === 'ALL' && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Registrar pagamento
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Pagamento</th>
                      <th>Pedido / Cliente</th>
                      <th>Método</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((p) => {
                      const isInAction = actionId === p.id;
                      const canComplete = p.status === 'PENDING';
                      const canFail = p.status === 'PENDING';
                      const canCancel = p.status === 'PENDING';

                      return (
                        <React.Fragment key={p.id}>
                          <tr>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-success-500 to-success-700 flex items-center justify-center shrink-0">
                                  <DollarIcon className="w-4 h-4 text-white" />
                                </div>
                                <code className="text-xs font-mono text-slate-500">
                                  #{p.id.slice(0, 8)}
                                </code>
                              </div>
                            </td>
                            <td>
                              <div>
                                <p className="font-medium text-slate-900 truncate">
                                  {p.customerName || '-'}
                                </p>
                                {p.orderPublicId && (
                                  <code className="text-xs font-mono text-slate-500">
                                    #{p.orderPublicId.slice(0, 8)}
                                  </code>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                                <span>{METHOD_ICON[p.paymentMethod]}</span>
                                {METHOD_LABELS[p.paymentMethod]}
                              </span>
                            </td>
                            <td>
                              <span className="font-semibold text-slate-900 tabular-nums">
                                {formatPrice(Number(p.amount))}
                              </span>
                            </td>
                            <td>
                              <Badge variant={STATUS_VARIANT[p.status]} dot>
                                {STATUS_LABELS[p.status]}
                              </Badge>
                            </td>
                            <td className="text-xs text-slate-500">
                              {p.paymentDate ? formatDateTime(p.paymentDate) : '-'}
                            </td>
                            <td>
                              {deletingId === p.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingId(null)}
                                    disabled={isDeleting}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(p.id)}
                                    isLoading={isDeleting}
                                  >
                                    Confirmar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  {canComplete && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => patchAction(p.id, 'complete')}
                                      disabled={isInAction}
                                      leftIcon={<CheckCircleIcon className="w-3.5 h-3.5" />}
                                    >
                                      Concluir
                                    </Button>
                                  )}
                                  {canFail && (
                                    <button
                                      onClick={() => patchAction(p.id, 'fail')}
                                      disabled={isInAction}
                                      className="text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-danger-700 hover:bg-danger-50 transition-colors"
                                    >
                                      Falhar
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      onClick={() => patchAction(p.id, 'cancel')}
                                      disabled={isInAction}
                                      className="text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setDeletingId(p.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                    title="Remover"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Página <span className="font-medium text-slate-900">{currentPage}</span> de{' '}
                    <span className="font-medium text-slate-900">{totalPages}</span>
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
        title="Novo Pagamento"
        description="Registre um pagamento para um pedido existente"
        size="lg"
      >
        <PaymentForm onSuccess={handleSuccess} onCancel={() => setIsCreateOpen(false)} />
      </Modal>
    </Layout>
  );
}
