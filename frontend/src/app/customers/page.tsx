'use client';

import React, { useState, useEffect } from 'react';
import { Customer, PaginatedResponse } from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
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

  const handleCreateClick = () => {
    setIsCreateOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingCustomer(null);
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleFormSuccess = () => {
    handleCloseModal();
    refetch();
  };

  const handleDeleteClick = (customerId: number) => {
    setDeletingId(customerId);
  };

  const handleCancelDelete = () => {
    setDeletingId(null);
  };

  const handleConfirmDelete = async (customerId: number) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/customers/${customerId}`);
      toast.success('Cliente deletado com sucesso');
      setDeletingId(null);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar cliente';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.totalPages || 0;
  const currentPage = page + 1;

  return (
    <Layout requireAuth>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <Button variant="primary" onClick={handleCreateClick}>
              + Novo Cliente
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <div className="mb-6">
            <Input
              label="Buscar por nome"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome do cliente..."
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CPF</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Cadastrado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((customer) => (
                      <React.Fragment key={customer.id}>
                        <tr>
                          <td className="font-medium">{customer.name}</td>
                          <td>
                            <Badge variant="default">{customer.cpf}</Badge>
                          </td>
                          <td className="text-gray-600">{customer.email}</td>
                          <td className="text-gray-600">{customer.phone || '-'}</td>
                          <td className="text-gray-600 text-sm">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td>
                            {deletingId === customer.id ? (
                              <div className="flex gap-2">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleConfirmDelete(customer.id!)}
                                  isLoading={isDeleting}
                                >
                                  Confirmar
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={handleCancelDelete}
                                  disabled={isDeleting}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(customer)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(customer.id!)}
                                >
                                  Deletar
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {deletingId === customer.id && (
                          <tr className="bg-danger-50">
                            <td colSpan={6} className="text-center py-2">
                              <span className="text-danger-700 font-medium">
                                Confirmar exclusão de {customer.name}?
                              </span>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || isLoading}
                  >
                    ← Anterior
                  </Button>
                  <span className="text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1 || isLoading}
                  >
                    Próximo →
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

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
