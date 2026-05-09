'use client';

import React, { useEffect, useState } from 'react';
import { Service, CreateServiceDTO } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

interface ServiceFormProps {
  service?: Service;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const isEditing = !!service;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price ? String(service.price) : '',
        durationMinutes: service.durationMinutes ? String(service.durationMinutes) : '',
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter ao menos 3 caracteres';
    }

    const priceNum = parseFloat(formData.price.replace(',', '.'));
    if (!formData.price.trim()) {
      newErrors.price = 'Preço é obrigatório';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Preço deve ser maior que 0';
    }

    if (formData.durationMinutes) {
      const dur = parseInt(formData.durationMinutes);
      if (isNaN(dur) || dur < 0) {
        newErrors.durationMinutes = 'Duração inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const priceNum = parseFloat(formData.price.replace(',', '.'));
      const duration = formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined;

      if (isEditing) {
        const params = new URLSearchParams();
        if (formData.name) params.append('name', formData.name);
        if (formData.description) params.append('description', formData.description);
        params.append('price', String(priceNum));
        if (duration !== undefined) params.append('durationMinutes', String(duration));

        await apiClient.put<Service>(`/services/${service!.id}?${params.toString()}`);
        toast.success('Serviço atualizado com sucesso');
      } else {
        const dto: CreateServiceDTO = {
          name: formData.name,
          description: formData.description || undefined,
          price: priceNum,
          durationMinutes: duration,
        };
        await apiClient.post<Service>('/services', dto);
        toast.success('Serviço cadastrado com sucesso');
      }
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar serviço';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <Input
          label="Nome do serviço"
          type="text"
          name="name"
          placeholder="Ex: Lavagem Completa"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
          maxLength={255}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
            maxLength={500}
            placeholder="Detalhes do que está incluso no serviço..."
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed resize-none"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formData.description.length}/500 caracteres
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Preço (R$)"
            type="text"
            inputMode="decimal"
            name="price"
            placeholder="89,90"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            disabled={isLoading}
            leftIcon={
              <span className="text-slate-500 text-sm font-medium">R$</span>
            }
          />

          <Input
            label="Duração (min)"
            type="number"
            name="durationMinutes"
            placeholder="60"
            value={formData.durationMinutes}
            onChange={handleChange}
            error={errors.durationMinutes}
            disabled={isLoading}
            min="0"
            helpText="Tempo estimado em minutos"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar serviço'}
        </Button>
      </div>
    </form>
  );
}
