'use client';

import React, { useState, useEffect } from 'react';
import { Customer, PaginatedResponse } from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card, CardBody } from '@/components/Card';
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
  UsersIcon,
} from '@/components/Icons';
import { CustomerForm } from './components/CustomerForm';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const url = debouncedSearch
    ? `/customers/search?name=${encodeURIComponent(debouncedSearch)}&page=${page}&size=10`
    : `/customers?page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Customer>>(url, [url]);

  const handleCreateClick = () => setIsCreateOpen(true);
  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingCustomer(null);
  };
  const handleEditClick = (customer: Customer) => setEditingCustomer(customer);
  const handleFormSuccess = () => {
    handleCloseModal();
    refetch();
  };
  const handleDeleteClick = (customerId: number) => setDeletingId(customerId);
  const handleCancelDelete = () => setDeletingId(null);

  const handleConfirmDelete = async (customerId: number) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/customers/${customerId}`);
      toast.success('Cliente removido com sucesso');
      setDeletingId(null);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover cliente';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatCpf = (cpf?: string) => {
    if (!cpf) return '-';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return cpf;
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Total</span>
              <Badge variant="default" size="md">
                {totalElements} {totalElements === 1 ? 'cliente' : 'clientes'}
              </Badge>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreateClick}
          >
            Novo Cliente
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          {/* Search Bar */}
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
              <p className="mt-4 text-sm text-slate-500">Carregando clientes...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <UsersIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {debouncedSearch ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {debouncedSearch
                  ? `Não encontramos clientes com "${debouncedSearch}". Tente outra busca.`
                  : 'Comece cadastrando seu primeiro cliente para gerenciar seu negócio.'}
              </p>
              {!debouncedSearch && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreateClick}
                >
                  Cadastrar primeiro cliente
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>CPF</th>
                      <th>Telefone</th>
                      <th>Cadastro</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((customer) => (
                      <React.Fragment key={customer.id}>
                        <tr>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                                {getInitials(customer.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {customer.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-slate-600">
                            {formatCpf(customer.cpf)}
                          </td>
                          <td className="text-slate-600">{customer.phone || '-'}</td>
                          <td className="text-slate-500 text-xs">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td>
                            {deletingId === customer.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelDelete}
                                  disabled={isDeleting}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleConfirmDelete(customer.id!)}
                                  isLoading={isDeleting}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditClick(customer)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                  title="Editar"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(customer.id!)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                  title="Excluir"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {deletingId === customer.id && (
                          <tr>
                            <td colSpan={5} className="!py-3 bg-danger-50/40">
                              <p className="text-xs text-danger-700 text-center">
                                Tem certeza que deseja excluir <strong>{customer.name}</strong>? Esta ação não pode ser desfeita.
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingCustomer}
        onClose={handleCloseModal}
        title={editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <CustomerForm
          customer={editingCustomer || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </Layout>
  );
}
