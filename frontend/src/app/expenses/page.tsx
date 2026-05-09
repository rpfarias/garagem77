'use client';

import React, { useState } from 'react';
import {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseStatus,
  PaginatedResponse,
} from '@/types';
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
  DollarIcon,
  SettingsIcon,
} from '@/components/Icons';
import { ExpenseForm } from './components/ExpenseForm';
import { CategoryManager } from './components/CategoryManager';
import toast from 'react-hot-toast';

const PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  CARTAO_CREDITO: 'Crédito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  DINHEIRO: 'Dinheiro',
  OUTRO: 'Outro',
};

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado',
};

const STATUS_VARIANT: Record<ExpenseStatus, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDENTE: 'warning',
  PAGO: 'success',
  ATRASADO: 'danger',
  CANCELADO: 'default',
};

function firstDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function lastDayOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export default function ExpensesPage() {
  const [page, setPage] = useState(0);
  const [start, setStart] = useState(firstDayOfMonth());
  const [end, setEnd] = useState(lastDayOfMonth());
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories } = useFetch<ExpenseCategory[]>('/expense-categories', []);

  const queryParams = new URLSearchParams();
  queryParams.append('page', String(page));
  queryParams.append('size', '15');
  queryParams.append('start', start);
  queryParams.append('end', end);
  if (statusFilter) queryParams.append('status', statusFilter);
  if (categoryFilter) queryParams.append('categoryId', categoryFilter);

  const url = `/expenses?${queryParams.toString()}`;
  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Expense>>(url, [url]);

  const handleSuccess = () => {
    setIsCreateOpen(false);
    setEditing(null);
    refetch();
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/expenses/${id}`);
      toast.success('Despesa removida');
      setDeletingId(null);
      refetch();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover despesa';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Aggregates from current page
  const periodTotal =
    data?.content?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const opexTotal =
    data?.content
      ?.filter((e) => e.categoryType === 'OPERACIONAL')
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const infraTotal =
    data?.content
      ?.filter((e) => e.categoryType === 'INFRAESTRUTURA')
      .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const overdueCount =
    data?.content?.filter((e) => e.paymentStatus === 'ATRASADO').length || 0;

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total no período</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBRL(periodTotal)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning-50 dark:bg-warning-950/40 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">OPEX (operacional)</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBRL(opexTotal)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-success-50 dark:bg-success-950/40 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Infraestrutura</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBRL(infraTotal)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-danger-50 dark:bg-danger-950/40 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-danger-600 dark:text-danger-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Atrasadas (página)</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {overdueCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Lista de despesas</span>
            <Badge variant="default" size="md">
              {totalElements}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<SettingsIcon className="w-4 h-4" />}
              onClick={() => setShowCategories(true)}
            >
              Categorias
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">De</label>
              <input
                type="date"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Até</label>
              <input
                type="date"
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ExpenseStatus | '');
                  setPage(0);
                }}
                className="px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(0);
                }}
                className="px-3 py-2 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">Todas</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Carregando despesas...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <DollarIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Nenhuma despesa no período
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                Cadastre suas despesas para acompanhar seus gastos no Dashboard e em Relatórios.
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-5"
                leftIcon={<PlusIcon className="w-4 h-4" />}
                onClick={() => setIsCreateOpen(true)}
              >
                Cadastrar primeira despesa
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Fornecedor</th>
                      <th>Categoria</th>
                      <th>Data</th>
                      <th>Vencimento</th>
                      <th>Pagamento</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((expense) => (
                      <React.Fragment key={expense.id}>
                        <tr>
                          <td>
                            <div className="min-w-0 max-w-md">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {expense.supplier}
                              </p>
                              {expense.description && (
                                <p className="text-xs text-slate-500 truncate">
                                  {expense.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {expense.categoryName}
                              </span>
                              <Badge
                                variant={
                                  expense.categoryType === 'OPERACIONAL' ? 'default' : 'success'
                                }
                                size="sm"
                              >
                                {expense.categoryType === 'OPERACIONAL' ? 'OPEX' : 'Infra'}
                              </Badge>
                            </div>
                          </td>
                          <td className="tabular-nums text-sm">{formatDate(expense.expenseDate)}</td>
                          <td className="tabular-nums text-sm">{formatDate(expense.dueDate)}</td>
                          <td className="text-sm">
                            {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                          </td>
                          <td>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                              {formatBRL(Number(expense.amount))}
                            </span>
                          </td>
                          <td>
                            <Badge variant={STATUS_VARIANT[expense.paymentStatus]} dot>
                              {STATUS_LABELS[expense.paymentStatus]}
                            </Badge>
                          </td>
                          <td>
                            {deletingId === expense.id ? (
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
                                  onClick={() => handleConfirmDelete(expense.id)}
                                  isLoading={isDeleting}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditing(expense)}
                                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-950/40 transition-colors"
                                  title="Editar"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingId(expense.id)}
                                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:text-danger-400 dark:hover:bg-danger-950/40 transition-colors"
                                  title="Remover"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {deletingId === expense.id && (
                          <tr>
                            <td colSpan={8} className="!py-3 bg-danger-50/40 dark:bg-danger-950/20">
                              <p className="text-xs text-danger-700 dark:text-danger-400 text-center">
                                Tem certeza que deseja remover a despesa de{' '}
                                <strong>{expense.supplier}</strong>?
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500">
                    Página{' '}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {page + 1}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {totalPages}
                    </span>
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
        onClose={() => {
          setIsCreateOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Editar Despesa' : 'Nova Despesa'}
        description={
          editing ? 'Atualize os dados da despesa' : 'Cadastre uma nova despesa'
        }
        size="lg"
      >
        <ExpenseForm
          expense={editing || undefined}
          onSuccess={handleSuccess}
          onCancel={() => {
            setIsCreateOpen(false);
            setEditing(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={showCategories}
        onClose={() => setShowCategories(false)}
        title="Categorias de Despesa"
        description="Gerencie as categorias usadas para classificar despesas"
        size="md"
      >
        <CategoryManager onClose={() => setShowCategories(false)} />
      </Modal>
    </Layout>
  );
}
