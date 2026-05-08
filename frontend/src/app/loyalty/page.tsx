'use client';

import React, { useState, useEffect } from 'react';
import {
  LoyaltyProgram,
  LoyaltyPoint,
  LoyaltyTransaction,
  Customer,
  CreateLoyaltyProgramDTO,
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
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparkleIcon,
  TrendUpIcon,
  TrendDownIcon,
  UsersIcon,
  ChartIcon,
} from '@/components/Icons';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Tab = 'PROGRAMS' | 'BALANCES';

// ============================================================================
// PROGRAM FORM
// ============================================================================

interface ProgramFormProps {
  program?: LoyaltyProgram;
  onSuccess: () => void;
  onCancel: () => void;
}

function ProgramForm({ program, onSuccess, onCancel }: ProgramFormProps) {
  const isEditing = !!program;
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(program?.name || '');
  const [pointsPerReal, setPointsPerReal] = useState(
    program?.pointsPerReal ? String(program.pointsPerReal) : '1'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome obrigatório';
    else if (name.trim().length < 3) e.name = 'Mínimo 3 caracteres';
    const ppr = parseFloat(pointsPerReal.replace(',', '.'));
    if (isNaN(ppr) || ppr <= 0) e.pointsPerReal = 'Deve ser > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const ppr = parseFloat(pointsPerReal.replace(',', '.'));
    try {
      if (isEditing) {
        const params = new URLSearchParams();
        params.append('name', name);
        params.append('pointsPerReal', String(ppr));
        await apiClient.put(`/loyalty-programs/${program!.id}?${params.toString()}`);
        toast.success('Programa atualizado');
      } else {
        const dto: CreateLoyaltyProgramDTO = { name, pointsPerReal: ppr };
        await apiClient.post('/loyalty-programs', dto);
        toast.success('Programa criado');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nome do programa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isLoading}
        placeholder="Ex: Garagem77 Premium"
      />

      <Input
        label="Pontos por real"
        type="text"
        inputMode="decimal"
        value={pointsPerReal}
        onChange={(e) => setPointsPerReal(e.target.value)}
        error={errors.pointsPerReal}
        disabled={isLoading}
        placeholder="1"
        helpText="Quantos pontos o cliente ganha por R$ 1 gasto"
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Criar programa'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// POINTS FORM (add/redeem)
// ============================================================================

interface PointsFormProps {
  customerPublicId: string;
  customerName: string;
  currentBalance: number;
  mode: 'ADD' | 'REDEEM';
  onSuccess: () => void;
  onCancel: () => void;
}

function PointsForm({
  customerPublicId,
  customerName,
  currentBalance,
  mode,
  onSuccess,
  onCancel,
}: PointsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(points);
    if (isNaN(n) || n <= 0) {
      setError('Quantidade inválida');
      return;
    }
    if (mode === 'REDEEM' && n > currentBalance) {
      setError(`Saldo insuficiente. Disponível: ${currentBalance}`);
      return;
    }
    setError('');

    setIsLoading(true);
    const action = mode === 'ADD' ? 'add-points' : 'redeem-points';
    const params = new URLSearchParams();
    params.append('points', String(n));
    if (description) params.append('description', description);

    try {
      // backend uses PATCH; apiClient lacks PATCH so use raw fetch
      const token = localStorage.getItem('auth_token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/loyalty-points/customer/${customerPublicId}/${action}?${params.toString()}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || 'Erro');
      }
      toast.success(mode === 'ADD' ? `+${n} pontos adicionados` : `${n} pontos resgatados`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
        <p className="text-xs text-slate-500">Cliente</p>
        <p className="text-sm font-medium text-slate-900">{customerName}</p>
        <p className="text-xs text-slate-500 mt-2">Saldo atual</p>
        <p className="text-lg font-bold text-primary-600 tabular-nums">
          {currentBalance} pontos
        </p>
      </div>

      <Input
        label={mode === 'ADD' ? 'Pontos a adicionar' : 'Pontos a resgatar'}
        type="number"
        min="1"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        error={error}
        disabled={isLoading}
        placeholder="100"
      />

      <Input
        label="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isLoading}
        placeholder={mode === 'ADD' ? 'Ex: Bônus de aniversário' : 'Ex: Desconto na lavagem'}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant={mode === 'ADD' ? 'primary' : 'danger'}
          isLoading={isLoading}
        >
          {mode === 'ADD' ? 'Adicionar pontos' : 'Resgatar pontos'}
        </Button>
      </div>
    </form>
  );
}

// ============================================================================
// TRANSACTIONS MODAL
// ============================================================================

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  loyaltyPointId: string | null;
  customerName: string;
}

function TransactionsModal({ isOpen, onClose, loyaltyPointId, customerName }: TransactionsModalProps) {
  const url = loyaltyPointId ? `/loyalty-points/${loyaltyPointId}/transactions` : null;
  const { data, isLoading } = useFetch<LoyaltyTransaction[]>(url || '', [url || '']);

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Extrato de pontos" description={customerName} size="lg">
      {isLoading ? (
        <p className="text-sm text-slate-500 py-4">Carregando...</p>
      ) : !data || data.length === 0 ? (
        <div className="py-12 text-center">
          <ChartIcon className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-sm text-slate-500 mt-2">Sem transações ainda.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 -mx-6">
          {data.map((tx) => (
            <div key={tx.id} className="px-6 py-3 flex items-center gap-3">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                  tx.transactionType === 'EARN'
                    ? 'bg-success-50 text-success-600'
                    : 'bg-warning-50 text-warning-600'
                )}
              >
                {tx.transactionType === 'EARN' ? (
                  <TrendUpIcon className="w-4 h-4" />
                ) : (
                  <TrendDownIcon className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {tx.description || (tx.transactionType === 'EARN' ? 'Pontos ganhos' : 'Pontos resgatados')}
                </p>
                <p className="text-xs text-slate-500">{formatDateTime(tx.createdAt)}</p>
              </div>
              <span
                className={clsx(
                  'font-bold tabular-nums shrink-0',
                  tx.transactionType === 'EARN' ? 'text-success-700' : 'text-warning-700'
                )}
              >
                {tx.transactionType === 'EARN' ? '+' : '−'}
                {tx.pointsValue}
              </span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LoyaltyPage() {
  const [tab, setTab] = useState<Tab>('PROGRAMS');

  // Programs state
  const [programPage, setProgramPage] = useState(0);
  const [programModal, setProgramModal] = useState<{ open: boolean; editing: LoyaltyProgram | null }>({
    open: false,
    editing: null,
  });
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);
  const [isDeletingProgram, setIsDeletingProgram] = useState(false);

  // Balances state
  const [balancePage, setBalancePage] = useState(0);
  const [pointsModal, setPointsModal] = useState<{
    open: boolean;
    customerPublicId: string;
    customerName: string;
    balance: number;
    mode: 'ADD' | 'REDEEM';
  }>({ open: false, customerPublicId: '', customerName: '', balance: 0, mode: 'ADD' });
  const [txModal, setTxModal] = useState<{
    open: boolean;
    pointId: string | null;
    customerName: string;
  }>({ open: false, pointId: null, customerName: '' });
  const [addingForCustomerId, setAddingForCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);

  // Fetch data
  const programsUrl = `/loyalty-programs?page=${programPage}&size=10`;
  const { data: programsData, isLoading: loadingPrograms, refetch: refetchPrograms } =
    useFetch<PaginatedResponse<LoyaltyProgram>>(programsUrl, [programsUrl]);

  const balancesUrl = `/loyalty-points?page=${balancePage}&size=10`;
  const { data: balancesData, isLoading: loadingBalances, refetch: refetchBalances } =
    useFetch<PaginatedResponse<LoyaltyPoint>>(balancesUrl, [balancesUrl]);

  // Active program
  const { data: activeProgram } = useFetch<LoyaltyProgram>('/loyalty-programs/active');

  useEffect(() => {
    if (tab === 'BALANCES') {
      apiClient
        .get<Customer[]>('/customers?paged=false')
        .then((data) => setCustomers(data || []))
        .catch(() => {});
    }
  }, [tab]);

  // Handlers
  const handleDeleteProgram = async (id: string) => {
    setIsDeletingProgram(true);
    try {
      await apiClient.delete(`/loyalty-programs/${id}`);
      toast.success('Programa removido');
      setDeletingProgramId(null);
      refetchPrograms();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao remover');
    } finally {
      setIsDeletingProgram(false);
    }
  };

  const toggleProgramActive = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/loyalty-programs/${id}/toggle-active`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro');
      }
      toast.success('Status alterado');
      refetchPrograms();
    } catch (e: any) {
      toast.error(e.message || 'Erro');
    }
  };

  const handleAddCustomer = async (customerId: string) => {
    setAddingForCustomerId(customerId);
    try {
      await apiClient.post(`/loyalty-points/customer/${customerId}`);
      toast.success('Cliente adicionado ao programa');
      setCustomerSelectOpen(false);
      refetchBalances();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro');
    } finally {
      setAddingForCustomerId(null);
    }
  };

  const programs = programsData?.content || [];
  const balances = balancesData?.content || [];
  const totalPoints = balances.reduce((sum, b) => sum + b.pointsBalance, 0);

  const formatPointsRatio = (n: number) => `${n} pt${n !== 1 ? 's' : ''} / R$ 1`;

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                <SparkleIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Programa ativo</p>
                <p className="text-base font-bold text-slate-900 truncate">
                  {activeProgram?.name || '—'}
                </p>
                {activeProgram && (
                  <p className="text-xs text-slate-500">
                    {formatPointsRatio(Number(activeProgram.pointsPerReal))}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-success-50 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Clientes inscritos</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {balancesData?.totalElements ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning-50 flex items-center justify-center">
                <TrendUpIcon className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Pontos em circulação (página)</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {totalPoints.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Card */}
        <Card>
          <div className="px-5 pt-3 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setTab('PROGRAMS')}
                className={clsx(
                  'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  tab === 'PROGRAMS'
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                )}
              >
                Programas
              </button>
              <button
                onClick={() => setTab('BALANCES')}
                className={clsx(
                  'px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  tab === 'BALANCES'
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                )}
              >
                Saldos por cliente
              </button>
            </div>
            <div className="pb-2.5">
              {tab === 'PROGRAMS' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setProgramModal({ open: true, editing: null })}
                >
                  Novo Programa
                </Button>
              )}
              {tab === 'BALANCES' && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setCustomerSelectOpen(true)}
                  disabled={!activeProgram}
                  title={!activeProgram ? 'Crie um programa ativo primeiro' : ''}
                >
                  Inscrever Cliente
                </Button>
              )}
            </div>
          </div>

          {/* PROGRAMS TAB */}
          {tab === 'PROGRAMS' && (
            <>
              {loadingPrograms ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : programs.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <SparkleIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Nenhum programa cadastrado
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                    Crie um programa de fidelidade para começar a recompensar seus clientes.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="mt-5"
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => setProgramModal({ open: true, editing: null })}
                  >
                    Criar primeiro programa
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Programa</th>
                        <th>Pontos / R$ 1</th>
                        <th>Status</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programs.map((p) => (
                        <React.Fragment key={p.id}>
                          <tr>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                                  <SparkleIcon className="w-4 h-4 text-white" />
                                </div>
                                <p className="font-medium text-slate-900">{p.name}</p>
                              </div>
                            </td>
                            <td className="font-mono tabular-nums">
                              {Number(p.pointsPerReal).toFixed(2)}
                            </td>
                            <td>
                              {p.active ? (
                                <Badge variant="success" dot>Ativo</Badge>
                              ) : (
                                <Badge variant="default" dot>Inativo</Badge>
                              )}
                            </td>
                            <td>
                              {deletingProgramId === p.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => setDeletingProgramId(null)}>
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteProgram(p.id)}
                                    isLoading={isDeletingProgram}
                                  >
                                    Confirmar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => toggleProgramActive(p.id)}
                                    className="text-xs px-2 py-1 rounded text-slate-500 hover:text-primary-700 hover:bg-primary-50"
                                  >
                                    {p.active ? 'Desativar' : 'Ativar'}
                                  </button>
                                  <button
                                    onClick={() => setProgramModal({ open: true, editing: p })}
                                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingProgramId(p.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(programsData?.totalPages || 0) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Página {programPage + 1} de {programsData?.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setProgramPage(Math.max(0, programPage - 1))} disabled={programPage === 0} leftIcon={<ChevronLeftIcon />}>
                      Anterior
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setProgramPage(programPage + 1)} disabled={programPage === (programsData?.totalPages || 1) - 1} rightIcon={<ChevronRightIcon />}>
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BALANCES TAB */}
          {tab === 'BALANCES' && (
            <>
              {loadingBalances ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                </div>
              ) : balances.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Nenhum cliente inscrito</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                    {activeProgram
                      ? 'Adicione clientes ao programa de fidelidade para começar.'
                      : 'Crie e ative um programa de fidelidade primeiro.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Programa</th>
                        <th>Saldo</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balances.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <div>
                              <p className="font-medium text-slate-900">{b.customerName || '-'}</p>
                              {b.customerCpf && (
                                <p className="text-xs text-slate-500 font-mono">{b.customerCpf}</p>
                              )}
                            </div>
                          </td>
                          <td className="text-slate-600">{b.programName || '-'}</td>
                          <td>
                            <span className="text-lg font-bold text-primary-700 tabular-nums">
                              {b.pointsBalance.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">pontos</span>
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  setTxModal({ open: true, pointId: b.id, customerName: b.customerName || '' })
                                }
                                className="text-xs px-2 py-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                title="Ver extrato"
                              >
                                Extrato
                              </button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPointsModal({
                                    open: true,
                                    customerPublicId: b.customerPublicId || '',
                                    customerName: b.customerName || '',
                                    balance: b.pointsBalance,
                                    mode: 'ADD',
                                  })
                                }
                                leftIcon={<TrendUpIcon className="w-3 h-3" />}
                              >
                                Adicionar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPointsModal({
                                    open: true,
                                    customerPublicId: b.customerPublicId || '',
                                    customerName: b.customerName || '',
                                    balance: b.pointsBalance,
                                    mode: 'REDEEM',
                                  })
                                }
                                disabled={b.pointsBalance <= 0}
                                leftIcon={<TrendDownIcon className="w-3 h-3" />}
                              >
                                Resgatar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(balancesData?.totalPages || 0) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    Página {balancePage + 1} de {balancesData?.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setBalancePage(Math.max(0, balancePage - 1))} disabled={balancePage === 0} leftIcon={<ChevronLeftIcon />}>
                      Anterior
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setBalancePage(balancePage + 1)} disabled={balancePage === (balancesData?.totalPages || 1) - 1} rightIcon={<ChevronRightIcon />}>
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Program Modal */}
      <Modal
        isOpen={programModal.open}
        onClose={() => setProgramModal({ open: false, editing: null })}
        title={programModal.editing ? 'Editar programa' : 'Novo programa'}
      >
        <ProgramForm
          program={programModal.editing || undefined}
          onSuccess={() => {
            setProgramModal({ open: false, editing: null });
            refetchPrograms();
          }}
          onCancel={() => setProgramModal({ open: false, editing: null })}
        />
      </Modal>

      {/* Points Modal */}
      <Modal
        isOpen={pointsModal.open}
        onClose={() => setPointsModal({ ...pointsModal, open: false })}
        title={pointsModal.mode === 'ADD' ? 'Adicionar pontos' : 'Resgatar pontos'}
      >
        <PointsForm
          customerPublicId={pointsModal.customerPublicId}
          customerName={pointsModal.customerName}
          currentBalance={pointsModal.balance}
          mode={pointsModal.mode}
          onSuccess={() => {
            setPointsModal({ ...pointsModal, open: false });
            refetchBalances();
          }}
          onCancel={() => setPointsModal({ ...pointsModal, open: false })}
        />
      </Modal>

      {/* Transactions Modal */}
      <TransactionsModal
        isOpen={txModal.open}
        onClose={() => setTxModal({ open: false, pointId: null, customerName: '' })}
        loyaltyPointId={txModal.pointId}
        customerName={txModal.customerName}
      />

      {/* Customer Selector Modal (Inscrever Cliente) */}
      <Modal
        isOpen={customerSelectOpen}
        onClose={() => setCustomerSelectOpen(false)}
        title="Inscrever cliente no programa"
        description="Selecione um cliente para criar a conta de pontos"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto -mx-6 px-6">
          {customers.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">Sem clientes cadastrados.</p>
          ) : (
            customers.map((c) => {
              const alreadyEnrolled = balances.some((b) => b.customerPublicId === c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !alreadyEnrolled && handleAddCustomer(c.id)}
                  disabled={alreadyEnrolled || addingForCustomerId === c.id}
                  className={clsx(
                    'w-full px-4 py-3 rounded-lg border flex items-center justify-between transition-colors',
                    alreadyEnrolled
                      ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'border-slate-200 hover:bg-primary-50 hover:border-primary-300'
                  )}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{c.cpf}</p>
                  </div>
                  {alreadyEnrolled && (
                    <Badge variant="default">Já inscrito</Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
      </Modal>
    </Layout>
  );
}
