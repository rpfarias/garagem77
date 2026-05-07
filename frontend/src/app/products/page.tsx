'use client';

import React, { useState, useEffect } from 'react';
import { Product, PaginatedResponse } from '@/types';
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
  SearchIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  TrendUpIcon,
  TrendDownIcon,
} from '@/components/Icons';
import { ProductForm } from './components/ProductForm';
import toast from 'react-hot-toast';

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const stockStatusOf = (p: Product): StockStatus => {
  if (p.quantityStock <= 0) return 'OUT_OF_STOCK';
  if (p.quantityStock <= p.minimumQuantity) return 'LOW_STOCK';
  return 'IN_STOCK';
};

const STATUS_LABEL: Record<StockStatus, string> = {
  IN_STOCK: 'Em estoque',
  LOW_STOCK: 'Estoque baixo',
  OUT_OF_STOCK: 'Sem estoque',
};

const STATUS_VARIANT: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  IN_STOCK: 'success',
  LOW_STOCK: 'warning',
  OUT_OF_STOCK: 'danger',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stockActionId, setStockActionId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const url = debouncedSearch
    ? `/products/search?name=${encodeURIComponent(debouncedSearch)}&page=${page}&size=10`
    : `/products?paged=true&page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Product>>(url, [url]);

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
      await apiClient.delete(`/products/${id}`);
      toast.success('Produto removido');
      setDeletingId(null);
      refetch();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao remover');
    } finally {
      setIsDeleting(false);
    }
  };

  const stockOperation = async (id: string, op: 'increase' | 'decrease') => {
    const qty = window.prompt(`Quantidade para ${op === 'increase' ? 'adicionar' : 'remover'}:`);
    if (!qty) return;
    const n = parseInt(qty);
    if (isNaN(n) || n <= 0) {
      toast.error('Quantidade inválida');
      return;
    }
    setStockActionId(id);
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = op === 'increase' ? 'increase-stock' : 'decrease-stock';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/products/${id}/${endpoint}?quantity=${n}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro');
      }
      toast.success(op === 'increase' ? `+${n} adicionado ao estoque` : `${n} removido do estoque`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar estoque');
    } finally {
      setStockActionId(null);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  // Stats from current page
  const lowStockCount =
    data?.content?.filter((p) => stockStatusOf(p) === 'LOW_STOCK').length || 0;
  const outOfStockCount =
    data?.content?.filter((p) => stockStatusOf(p) === 'OUT_OF_STOCK').length || 0;
  const totalValue =
    data?.content?.reduce(
      (sum, p) => sum + Number(p.unitPrice) * p.quantityStock,
      0
    ) || 0;

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total cadastrados</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {totalElements}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning-50 flex items-center justify-center">
                <TrendDownIcon className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Estoque baixo (página)</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {lowStockCount + outOfStockCount}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-success-50 flex items-center justify-center">
                <TrendUpIcon className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Valor em estoque (página)</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatPrice(totalValue)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total</span>
            <Badge variant="default" size="md">
              {totalElements} {totalElements === 1 ? 'produto' : 'produtos'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Novo Produto
          </Button>
        </div>

        <Card>
          {/* Search */}
          <div className="p-5 border-b border-slate-100">
            <div className="max-w-md">
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<SearchIcon className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Carregando produtos...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <PackageIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {debouncedSearch ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {debouncedSearch
                  ? `Não encontramos produtos com "${debouncedSearch}".`
                  : 'Cadastre os produtos do seu inventário para controlar o estoque.'}
              </p>
              {!debouncedSearch && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => setIsCreateOpen(true)}
                >
                  Cadastrar primeiro produto
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>SKU</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((product) => {
                      const status = stockStatusOf(product);
                      const isStockBusy = stockActionId === product.id;
                      return (
                        <React.Fragment key={product.id}>
                          <tr>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                                  <PackageIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0 max-w-md">
                                  <p className="font-medium text-slate-900 truncate">
                                    {product.name}
                                  </p>
                                  {product.description && (
                                    <p className="text-xs text-slate-500 truncate">
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              {product.sku ? (
                                <code className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                                  {product.sku}
                                </code>
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </td>
                            <td>
                              <span className="font-semibold text-slate-900 tabular-nums">
                                {formatPrice(Number(product.unitPrice))}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 tabular-nums">
                                  {product.quantityStock}
                                </span>
                                <span className="text-xs text-slate-400">
                                  / mín {product.minimumQuantity}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <button
                                    onClick={() => stockOperation(product.id, 'decrease')}
                                    disabled={isStockBusy}
                                    className="w-6 h-6 rounded text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors text-sm font-bold disabled:opacity-30"
                                    title="Remover estoque"
                                  >
                                    −
                                  </button>
                                  <button
                                    onClick={() => stockOperation(product.id, 'increase')}
                                    disabled={isStockBusy}
                                    className="w-6 h-6 rounded text-slate-400 hover:text-success-600 hover:bg-success-50 transition-colors text-sm font-bold disabled:opacity-30"
                                    title="Adicionar estoque"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td>
                              <Badge variant={STATUS_VARIANT[status]} dot>
                                {STATUS_LABEL[status]}
                              </Badge>
                            </td>
                            <td>
                              {deletingId === product.id ? (
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
                                    onClick={() => handleConfirmDelete(product.id)}
                                    isLoading={isDeleting}
                                  >
                                    Confirmar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => setEditing(product)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                    title="Editar"
                                  >
                                    <EditIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(product.id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                    title="Remover"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {deletingId === product.id && (
                            <tr>
                              <td colSpan={6} className="!py-3 bg-danger-50/40">
                                <p className="text-xs text-danger-700 text-center">
                                  Tem certeza que deseja remover{' '}
                                  <strong>{product.name}</strong>?
                                </p>
                              </td>
                            </tr>
                          )}
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
        isOpen={isCreateOpen || !!editing}
        onClose={handleClose}
        title={editing ? 'Editar Produto' : 'Novo Produto'}
        description={
          editing
            ? 'Atualize os dados do produto'
            : 'Cadastre um novo produto no inventário'
        }
        size="lg"
      >
        <ProductForm
          product={editing || undefined}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      </Modal>
    </Layout>
  );
}
