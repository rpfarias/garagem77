'use client';

import React, { useEffect, useState } from 'react';
import { Customer, Vehicle, CreateVehicleDTO, UpdateVehicleDTO } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const isEditing = !!vehicle;
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    brand: '',
    color: '',
    year: '',
    observations: '',
    customerId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || '',
        model: vehicle.model || '',
        brand: vehicle.brand || '',
        color: vehicle.color || '',
        year: vehicle.year ? String(vehicle.year) : '',
        observations: vehicle.observations || '',
        customerId: vehicle.customerPublicId || '',
      });
    }
  }, [vehicle]);

  useEffect(() => {
    if (isEditing) return;
    setLoadingCustomers(true);
    apiClient
      .get<Customer[]>('/customers')
      .then((data) => setCustomers(data || []))
      .catch(() => toast.error('Erro ao carregar clientes'))
      .finally(() => setLoadingCustomers(false));
  }, [isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate.trim()) {
      newErrors.plate = 'Placa é obrigatória';
    } else if (formData.plate.trim().length < 7) {
      newErrors.plate = 'Placa deve ter ao menos 7 caracteres';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (!isEditing && !formData.customerId) {
      newErrors.customerId = 'Selecione um cliente';
    }

    if (formData.year && (parseInt(formData.year) < 1900 || parseInt(formData.year) > 2100)) {
      newErrors.year = 'Ano inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isEditing) {
        const params = new URLSearchParams();
        if (formData.plate) params.append('plate', formData.plate);
        if (formData.model) params.append('model', formData.model);
        if (formData.brand) params.append('brand', formData.brand);
        if (formData.color) params.append('color', formData.color);
        if (formData.year) params.append('year', formData.year);
        if (formData.observations) params.append('observations', formData.observations);

        await apiClient.put<Vehicle>(`/vehicles/${vehicle!.id}?${params.toString()}`);
        toast.success('Veículo atualizado com sucesso');
      } else {
        const dto: CreateVehicleDTO = {
          plate: formData.plate.toUpperCase(),
          model: formData.model,
          brand: formData.brand || undefined,
          color: formData.color || undefined,
          year: formData.year ? parseInt(formData.year) : undefined,
          observations: formData.observations || undefined,
          customerCpf: formData.customerId,
        };
        await apiClient.post<Vehicle>('/vehicles', dto);
        toast.success('Veículo cadastrado com sucesso');
      }
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar veículo';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {!isEditing && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Cliente</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              disabled={isLoading || loadingCustomers}
              className={`w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 bg-white border shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed ${
                errors.customerId ? 'border-danger-300' : 'border-slate-200'
              }`}
            >
              <option value="">
                {loadingCustomers ? 'Carregando clientes...' : 'Selecione um cliente'}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.cpf}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <span className="text-xs text-danger-600">{errors.customerId}</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Placa"
            type="text"
            name="plate"
            placeholder="ABC1D23"
            value={formData.plate}
            onChange={handleChange}
            error={errors.plate}
            disabled={isLoading}
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />

          <Input
            label="Ano"
            type="number"
            name="year"
            placeholder="2024"
            value={formData.year}
            onChange={handleChange}
            error={errors.year}
            disabled={isLoading}
            min="1900"
            max="2100"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Marca"
            type="text"
            name="brand"
            placeholder="Honda, Toyota..."
            value={formData.brand}
            onChange={handleChange}
            disabled={isLoading}
          />

          <Input
            label="Modelo"
            type="text"
            name="model"
            placeholder="Civic, Corolla..."
            value={formData.model}
            onChange={handleChange}
            error={errors.model}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Cor"
          type="text"
          name="color"
          placeholder="Preto, Branco..."
          value={formData.color}
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Observações</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
            maxLength={500}
            placeholder="Detalhes adicionais sobre o veículo..."
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-200 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
          />
          <span className="text-xs text-slate-500">
            {formData.observations.length}/500 caracteres
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar veículo'}
        </Button>
      </div>
    </form>
  );
}
