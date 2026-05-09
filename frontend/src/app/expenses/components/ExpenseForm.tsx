'use client';

import React, { useEffect, useState } from 'react';
import {
  Expense,
  ExpenseCategory,
  CreateExpenseDTO,
  ExpensePaymentMethod,
  ExpenseStatus,
  CategoryType,
} from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { PlusIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  expense?: Expense;
  onSuccess: () => void;
  onCancel: () => void;
}

const PAYMENT_METHOD_LABELS: Record<ExpensePaymentMethod, string> = {
  CARTAO_CREDITO: 'Cartão de Crédito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  DINHEIRO: 'Dinheiro',
  OUTRO: 'Outro',
};

const STATUS_LABELS: Record<Exclude<ExpenseStatus, 'ATRASADO'>, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
};

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const isEditing = !!expense;
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    amount: '',
    paymentMethod: 'PIX' as ExpensePaymentMethod,
    paymentStatus: 'PENDENTE' as Exclude<ExpenseStatus, 'ATRASADO'>,
    categoryId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (expense) {
      setFormData({
        supplier: expense.supplier || '',
        description: expense.description || '',
        expenseDate: expense.expenseDate || '',
        dueDate: expense.dueDate || '',
        amount: expense.amount ? String(expense.amount) : '',
        paymentMethod: expense.paymentMethod,
        paymentStatus:
          expense.paymentStatus === 'ATRASADO'
            ? 'PENDENTE'
            : (expense.paymentStatus as Exclude<ExpenseStatus, 'ATRASADO'>),
        categoryId: expense.categoryId || '',
      });
    }
  }, [expense]);

  async function loadCategories() {
    try {
      const data = await apiClient.get<ExpenseCategory[]>('/expense-categories');
      setCategories(data);
    } catch {
      toast.error('Erro ao carregar categorias');
    }
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.supplier.trim()) e.supplier = 'Fornecedor é obrigatório';
    if (!formData.expenseDate) e.expenseDate = 'Data é obrigatória';
    const amountNum = parseFloat(formData.amount.replace(',', '.'));
    if (!formData.amount.trim()) e.amount = 'Valor é obrigatório';
    else if (isNaN(amountNum) || amountNum <= 0) e.amount = 'Valor deve ser maior que 0';
    if (!formData.categoryId) e.categoryId = 'Categoria é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = ev.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const amount = parseFloat(formData.amount.replace(',', '.'));
      const dto: CreateExpenseDTO = {
        supplier: formData.supplier.trim(),
        description: formData.description || undefined,
        expenseDate: formData.expenseDate,
        dueDate: formData.dueDate || undefined,
        amount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        categoryId: formData.categoryId,
      };

      if (isEditing) {
        await apiClient.put<Expense>(`/expenses/${expense!.id}`, dto);
        toast.success('Despesa atualizada com sucesso');
      } else {
        await apiClient.post<Expense>('/expenses', dto);
        toast.success('Despesa cadastrada com sucesso');
      }
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao salvar despesa';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass =
    'w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed';

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <Input
            label="Fornecedor"
            type="text"
            name="supplier"
            placeholder="Ex: Mercado Auto Peças"
            value={formData.supplier}
            onChange={handleChange}
            error={errors.supplier}
            disabled={isLoading}
            maxLength={255}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={2}
              maxLength={1000}
              placeholder="Detalhes da despesa..."
              className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data da despesa"
              type="date"
              name="expenseDate"
              value={formData.expenseDate}
              onChange={handleChange}
              error={errors.expenseDate}
              disabled={isLoading}
            />
            <Input
              label="Vencimento (opcional)"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isLoading}
              helpText="Para alertas de atraso"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor (R$)"
              type="text"
              inputMode="decimal"
              name="amount"
              placeholder="500,00"
              value={formData.amount}
              onChange={handleChange}
              error={errors.amount}
              disabled={isLoading}
              leftIcon={<span className="text-slate-500 text-sm font-medium">R$</span>}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Forma de pagamento
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                disabled={isLoading}
                className={selectClass}
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                disabled={isLoading}
                className={selectClass}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                "Atrasado" é definido automaticamente quando o vencimento passa.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Categoria
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  disabled={isLoading}
                >
                  <PlusIcon className="w-3 h-3" />
                  Nova
                </button>
              </div>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoading}
                className={selectClass}
              >
                <option value="">Selecione...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'OPERACIONAL' ? 'OPEX' : 'Infra'})
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-xs text-danger-600">{errors.categoryId}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar despesa'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showNewCategory}
        onClose={() => setShowNewCategory(false)}
        title="Nova Categoria"
        size="sm"
      >
        <NewCategoryForm
          onCreated={(cat) => {
            setCategories((prev) => [...prev, cat]);
            setFormData((prev) => ({ ...prev, categoryId: cat.id }));
            setShowNewCategory(false);
          }}
          onCancel={() => setShowNewCategory(false)}
        />
      </Modal>
    </>
  );
}

function NewCategoryForm({
  onCreated,
  onCancel,
}: {
  onCreated: (cat: ExpenseCategory) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('OPERACIONAL');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    setIsLoading(true);
    try {
      const created = await apiClient.post<ExpenseCategory>('/expense-categories', {
        name: name.trim(),
        type,
      });
      toast.success('Categoria criada');
      onCreated(created);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar categoria';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label="Nome"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        error={error}
        disabled={isLoading}
        maxLength={100}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
        >
          <option value="OPERACIONAL">Operacional (OPEX)</option>
          <option value="INFRAESTRUTURA">Infraestrutura</option>
        </select>
        <span className="text-xs text-slate-500">
          Operacional: marketing, pessoal, manutenção. Infraestrutura: servidores, software/SaaS.
        </span>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Criar
        </Button>
      </div>
    </form>
  );
}
