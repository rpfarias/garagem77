'use client';

import React, { useState, useEffect } from 'react';
import { Service, PaginatedResponse } from '@/types';
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
  WrenchIcon,
  ClockIcon,
  DollarIcon,
} from '@/components/Icons';
import { ServiceForm } from './components/ServiceForm';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const url = debouncedSearch
    ? `/services/search-paged?name=${encodeURIComponent(debouncedSearch)}&page=${page}&size=10`
    : `/services?paged=true&page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Service>>(url, [url]);

  const handleCreateClick = () => setIsCreateOpen(true);
  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingService(null);
  };
  const handleEditClick = (service: Service) => setEditingService(service);
  const handleFormSuccess = () => {
    handleCloseModal();
    refetch();
  };
  const handleDeleteClick = (serviceId: string) => setDeletingId(serviceId);
  const handleCancelDelete = () => setDeletingId(null);

  const handleConfirmDelete = async (serviceId: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/services/${serviceId}`);
      toast.success('Serviço removido com sucesso');
      setDeletingId(null);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover serviço';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return '-';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  // Compute aggregate stats from current page (visual only)
  const avgPrice =
    data?.content && data.content.length > 0
      ? data.content.reduce((sum, s) => sum + Number(s.price), 0) / data.content.length
      : 0;

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                <WrenchIcon className="w-5 h-5 text-primary-600" />
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
              <div className="w-11 h-11 rounded-xl bg-success-50 flex items-center justify-center">
                <DollarIcon className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Preço médio</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {avgPrice > 0 ? formatPrice(avgPrice) : 'R$ 0,00'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-warning-50 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Catálogo ativo</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">
                  {data?.content?.filter((s) => s.active).length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Lista de serviços</span>
            <Badge variant="default" size="md">
              {totalElements}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreateClick}
          >
            Novo Serviço
          </Button>
        </div>

        {/* Main Card */}
        <Card>
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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Carregando serviços...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <WrenchIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {debouncedSearch ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm">
                {debouncedSearch
                  ? `Não encontramos serviços com "${debouncedSearch}".`
                  : 'Cadastre os serviços oferecidos pela sua oficina para começar a montar seu catálogo.'}
              </p>
              {!debouncedSearch && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreateClick}
                >
                  Cadastrar primeiro serviço
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Preço</th>
                      <th>Duração</th>
                      <th>Status</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((service) => (
                      <React.Fragment key={service.id}>
                        <tr>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                                <WrenchIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0 max-w-md">
                                <p className="font-medium text-slate-900 truncate">
                                  {service.name}
                                </p>
                                {service.description && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-semibold text-slate-900 tabular-nums">
                              {formatPrice(Number(service.price))}
                            </span>
                          </td>
                          <td className="text-slate-600 tabular-nums">
                            {formatDuration(service.durationMinutes)}
                          </td>
                          <td>
                            {service.active ? (
                              <Badge variant="success" dot>
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="default" dot>
                                Inativo
                              </Badge>
                            )}
                          </td>
                          <td>
                            {deletingId === service.id ? (
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
                                  onClick={() => handleConfirmDelete(service.id)}
                                  isLoading={isDeleting}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditClick(service)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                  title="Editar"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(service.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                                  title="Remover"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {deletingId === service.id && (
                          <tr>
                            <td colSpan={5} className="!py-3 bg-danger-50/40">
                              <p className="text-xs text-danger-700 text-center">
                                Tem certeza que deseja remover{' '}
                                <strong>{service.name}</strong>? Esta ação não pode ser desfeita.
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
        isOpen={isCreateOpen || !!editingService}
        onClose={handleCloseModal}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        description={
          editingService
            ? 'Atualize os dados do serviço'
            : 'Adicione um novo serviço ao catálogo'
        }
        size="lg"
      >
        <ServiceForm
          service={editingService || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </Layout>
  );
}
