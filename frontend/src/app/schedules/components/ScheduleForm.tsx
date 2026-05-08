'use client';

import React, { useEffect, useState } from 'react';
import { Customer, Vehicle, Service, Schedule, CreateScheduleDTO } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

interface ScheduleFormProps {
  schedule?: Schedule;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ScheduleForm({ schedule, onSuccess, onCancel }: ScheduleFormProps) {
  const isEditing = !!schedule;
  const [isLoading, setIsLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    vehicleId: '',
    serviceId: '',
    scheduledAt: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill on edit
  useEffect(() => {
    if (schedule) {
      // Edit only allows scheduledAt + notes (backend constraint)
      setFormData({
        customerId: schedule.customerPublicId || '',
        vehicleId: schedule.vehiclePublicId || '',
        serviceId: schedule.serviceId || '',
        scheduledAt: schedule.scheduledAt
          ? new Date(schedule.scheduledAt).toISOString().slice(0, 16)
          : '',
        notes: schedule.notes || '',
      });
    }
  }, [schedule]);

  // Load reference data on create
  useEffect(() => {
    if (isEditing) return;
    setLoadingLists(true);
    Promise.all([
      apiClient.get<Customer[]>('/customers?paged=false'),
      apiClient.get<{ content: Service[] } | Service[]>('/services?paged=false'),
    ])
      .then(([customersData, servicesData]) => {
        setCustomers(customersData || []);
        // services may be List or Page depending on flag
        const svcList = Array.isArray(servicesData)
          ? servicesData
          : (servicesData as any)?.content || [];
        setServices(svcList);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoadingLists(false));
  }, [isEditing]);

  // Load vehicles when customer changes
  useEffect(() => {
    if (isEditing || !formData.customerId) {
      setVehicles([]);
      return;
    }
    apiClient
      .get<Vehicle[]>(`/vehicles/customer/${formData.customerId}`)
      .then((data) => setVehicles(data || []))
      .catch(() => toast.error('Erro ao carregar veículos do cliente'));
  }, [formData.customerId, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditing) {
      if (!formData.customerId) newErrors.customerId = 'Selecione um cliente';
      if (!formData.vehicleId) newErrors.vehicleId = 'Selecione um veículo';
      if (!formData.serviceId) newErrors.serviceId = 'Selecione um serviço';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Data e hora obrigatórias';
    } else if (new Date(formData.scheduledAt) <= new Date()) {
      newErrors.scheduledAt = 'A data deve ser no futuro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Reset vehicle if customer changes
      if (name === 'customerId') next.vehicleId = '';
      return next;
    });
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
        params.append('scheduledAt', formData.scheduledAt);
        if (formData.notes) params.append('notes', formData.notes);

        await apiClient.put<Schedule>(`/schedules/${schedule!.id}?${params.toString()}`);
        toast.success('Agendamento atualizado');
      } else {
        const dto: CreateScheduleDTO = {
          customerId: formData.customerId,
          vehicleId: formData.vehicleId,
          serviceId: formData.serviceId,
          scheduledAt: formData.scheduledAt,
          notes: formData.notes || undefined,
        };
        await apiClient.post<Schedule>('/schedules', dto);
        toast.success('Agendamento criado com sucesso');
      }
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar agendamento';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 bg-white border shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed ${
      hasError ? 'border-danger-300' : 'border-slate-200'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isEditing && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Cliente</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              disabled={isLoading || loadingLists}
              className={selectClass(!!errors.customerId)}
            >
              <option value="">
                {loadingLists ? 'Carregando...' : 'Selecione um cliente'}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Veículo</label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              disabled={isLoading || !formData.customerId}
              className={selectClass(!!errors.vehicleId)}
            >
              <option value="">
                {!formData.customerId
                  ? 'Selecione um cliente primeiro'
                  : vehicles.length === 0
                  ? 'Cliente sem veículos cadastrados'
                  : 'Selecione um veículo'}
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} — {v.brand ? `${v.brand} ${v.model}` : v.model}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <span className="text-xs text-danger-600">{errors.vehicleId}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Serviço</label>
            <select
              name="serviceId"
              value={formData.serviceId}
              onChange={handleChange}
              disabled={isLoading || loadingLists}
              className={selectClass(!!errors.serviceId)}
            >
              <option value="">
                {loadingLists ? 'Carregando...' : 'Selecione um serviço'}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — R$ {Number(s.price).toFixed(2).replace('.', ',')}
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <span className="text-xs text-danger-600">{errors.serviceId}</span>
            )}
          </div>
        </>
      )}

      {isEditing && schedule && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
          <p className="text-xs text-slate-500">Cliente / Veículo / Serviço</p>
          <p className="text-sm font-medium text-slate-900">
            {schedule.customerName} • {schedule.vehiclePlate} • {schedule.serviceName}
          </p>
          <p className="text-xs text-slate-500">
            Estes campos não podem ser alterados após a criação.
          </p>
        </div>
      )}

      <Input
        label="Data e hora"
        type="datetime-local"
        name="scheduledAt"
        value={formData.scheduledAt}
        onChange={handleChange}
        error={errors.scheduledAt}
        disabled={isLoading}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Observações</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          disabled={isLoading}
          rows={3}
          maxLength={500}
          placeholder="Detalhes adicionais sobre o agendamento..."
          className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-200 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
        />
        <span className="text-xs text-slate-500">
          {formData.notes.length}/500 caracteres
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Criar agendamento'}
        </Button>
      </div>
    </form>
  );
}
