'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, PaginatedResponse } from '@/types';
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
  CarIcon,
} from '@/components/Icons';
import { VehicleForm } from './components/VehicleForm';
import toast from 'react-hot-toast';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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
    ? `/vehicles/search?plate=${encodeURIComponent(debouncedSearch)}&page=${page}&size=10`
    : `/vehicles?page=${page}&size=10`;

  const { data, isLoading, refetch } = useFetch<PaginatedResponse<Vehicle>>(url, [url]);

  const handleCreateClick = () => setIsCreateOpen(true);
  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setEditingVehicle(null);
  };
  const handleEditClick = (vehicle: Vehicle) => setEditingVehicle(vehicle);
  const handleFormSuccess = () => {
    handleCloseModal();
    refetch();
  };
  const handleDeleteClick = (vehicleId: string) => setDeletingId(vehicleId);
  const handleCancelDelete = () => setDeletingId(null);

  const handleConfirmDelete = async (vehicleId: string) => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/vehicles/${vehicleId}`);
      toast.success('Veículo removido com sucesso');
      setDeletingId(null);
      refetch();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover veículo';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = page + 1;

  const formatPlate = (plate: string) => {
    if (!plate) return '-';
    return plate.toUpperCase();
  };

  return (
    <Layout requireAuth>
      <div className="space-y-5">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Total</span>
            <Badge variant="default" size="md">
              {totalElements} {totalElements === 1 ? 'veículo' : 'veículos'}
            </Badge>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusIcon className="w-4 h-4" />}
            onClick={handleCreateClick}
          >
            Novo Veículo
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          {/* Search Bar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="max-w-md">
              <Input
                placeholder="Buscar por placa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<SearchIcon className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Carregando veículos...</p>
            </div>
          ) : !data?.content || data.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <CarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {debouncedSearch ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                {debouncedSearch
                  ? `Não encontramos veículos com a placa "${debouncedSearch}".`
                  : 'Cadastre veículos para vincular a clientes e agendamentos.'}
              </p>
              {!debouncedSearch && (
                <Button
                  variant="primary"
                  size="md"
                  className="mt-5"
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreateClick}
                >
                  Cadastrar primeiro veículo
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Veículo</th>
                      <th>Placa</th>
                      <th>Cliente</th>
                      <th>Ano</th>
                      <th>Cadastro</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((vehicle) => (
                      <React.Fragment key={vehicle.id}>
                        <tr>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0">
                                <CarIcon className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.model}
                                </p>
                                {vehicle.color && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {vehicle.color}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-700 text-white font-mono text-xs font-bold tracking-wider">
                              {formatPlate(vehicle.plate)}
                            </span>
                          </td>
                          <td className="text-slate-600 dark:text-slate-400">
                            {vehicle.customerName || (
                              <span className="text-slate-400 dark:text-slate-500 italic">-</span>
                            )}
                          </td>
                          <td className="text-slate-600 dark:text-slate-400 tabular-nums">
                            {vehicle.year || '-'}
                          </td>
                          <td className="text-slate-500 dark:text-slate-400 text-xs">
                            {vehicle.createdAt
                              ? new Date(vehicle.createdAt).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td>
                            {deletingId === vehicle.id ? (
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
                                  onClick={() => handleConfirmDelete(vehicle.id)}
                                  isLoading={isDeleting}
                                >
                                  Confirmar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEditClick(vehicle)}
                                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-950/40 transition-colors"
                                  title="Editar"
                                >
                                  <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(vehicle.id)}
                                  className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-danger-600 hover:bg-danger-50 dark:hover:text-danger-400 dark:hover:bg-danger-950/40 transition-colors"
                                  title="Excluir"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {deletingId === vehicle.id && (
                          <tr>
                            <td colSpan={6} className="!py-3 bg-danger-50/40 dark:bg-danger-950/20">
                              <p className="text-xs text-danger-700 dark:text-danger-400 text-center">
                                Tem certeza que deseja excluir o veículo{' '}
                                <strong>{formatPlate(vehicle.plate)}</strong>? Esta ação não pode ser desfeita.
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingVehicle}
        onClose={handleCloseModal}
        title={editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
        size="lg"
      >
        <VehicleForm
          vehicle={editingVehicle || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </Layout>
  );
}
