'use client';

import React, { useState, useEffect } from 'react';
import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

interface CustomerFormProps {
  customer?: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const isEditing = !!customer;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Mínimo 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing) {
      const cpfDigits = formData.cpf.replace(/\D/g, '');
      if (!cpfDigits) {
        newErrors.cpf = 'CPF é obrigatório';
      } else if (cpfDigits.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      newErrors.phone = 'Telefone deve ter 10-20 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const cpfDigits = formData.cpf.replace(/\D/g, '');

    try {
      if (isEditing) {
        const updateDto: UpdateCustomerDTO = {
          name: formData.name,
          email: formData.email,
          phone: phoneDigits,
          address: formData.address,
        };
        await apiClient.put<Customer>(`/customers/${customer!.id}`, updateDto);
        toast.success('Cliente atualizado com sucesso');
      } else {
        const createDto: CreateCustomerDTO = {
          name: formData.name,
          email: formData.email,
          cpf: cpfDigits,
          phone: phoneDigits,
          address: formData.address || undefined,
        };
        await apiClient.post<Customer>('/customers', createDto);
        toast.success('Cliente criado com sucesso');
      }
      onSuccess();
    } catch (error: any) {
      // Try to extract validation errors from backend
      const data = error.response?.data;
      let message = data?.message || 'Erro ao salvar cliente';
      if (data?.validationErrors) {
        const fieldErrors = Object.entries(data.validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(' • ');
        message = fieldErrors || message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <Input
          label="Nome completo *"
          type="text"
          name="name"
          placeholder="João da Silva"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
        />

        <Input
          label="Email *"
          type="email"
          name="email"
          placeholder="cliente@email.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
        />

        {!isEditing && (
          <Input
            label="CPF *"
            type="text"
            name="cpf"
            placeholder="000.000.000-00"
            value={formData.cpf}
            onChange={handleChange}
            error={errors.cpf}
            disabled={isLoading}
            helpText="11 dígitos (com ou sem pontuação)"
            maxLength={14}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Telefone *"
            type="text"
            name="phone"
            placeholder="(11) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            helpText="DDD + número"
          />

          <Input
            label="Endereço"
            type="text"
            name="address"
            placeholder="Rua, número (opcional)"
            value={formData.address}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Criar cliente'}
        </Button>
      </div>
    </form>
  );
}
