'use client';

import React, { useEffect, useState } from 'react';
import { ExpenseCategory, CategoryType } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface CategoryManagerProps {
  onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setIsLoading(true);
    try {
      const data = await apiClient.get<ExpenseCategory[]>('/expense-categories');
      setCategories(data);
    } catch {
      toast.error('Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(cat: ExpenseCategory) {
    if (!confirm(`Desativar categoria "${cat.name}"?`)) return;
    try {
      await apiClient.delete(`/expense-categories/${cat.id}`);
      toast.success('Categoria desativada');
      load();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao remover';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      {!showForm && !editing ? (
        <>
          <div className="flex items-center justify-end">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setShowForm(true)}
            >
              Nova categoria
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-8">Carregando...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma categoria cadastrada</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                    <Badge variant={cat.type === 'OPERACIONAL' ? 'default' : 'success'}>
                      {cat.type === 'OPERACIONAL' ? 'OPEX' : 'Infra'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(cat)}
                      className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-950/40 transition-colors"
                      title="Editar"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:text-danger-400 dark:hover:bg-danger-950/40 transition-colors"
                      title="Desativar"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </>
      ) : (
        <CategoryForm
          category={editing || undefined}
          onSuccess={() => {
            setEditing(null);
            setShowForm(false);
            load();
          }}
          onCancel={() => {
            setEditing(null);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: {
  category?: ExpenseCategory;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<CategoryType>(category?.type || 'OPERACIONAL');
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
      if (isEditing) {
        await apiClient.put(`/expense-categories/${category!.id}`, { name: name.trim(), type });
        toast.success('Categoria atualizada');
      } else {
        await apiClient.post('/expense-categories', { name: name.trim(), type });
        toast.success('Categoria criada');
      }
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao salvar';
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
        placeholder="Ex: Marketing"
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
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
