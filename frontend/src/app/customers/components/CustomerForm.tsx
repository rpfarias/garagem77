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
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing) {
      if (!formData.cpf.trim()) {
        newErrors.cpf = 'CPF é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        const updateDto: UpdateCustomerDTO = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        };
        await apiClient.put<Customer>(`/customers/${customer!.id}`, updateDto);
        toast.success('Cliente atualizado com sucesso');
      } else {
        const createDto: CreateCustomerDTO = {
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf,
          phone: formData.phone,
          address: formData.address,
        };
        await apiClient.post<Customer>('/customers', createDto);
        toast.success('Cliente criado com sucesso');
      }
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome *"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        disabled={isLoading}
      />

      <Input
        label="Email *"
        type="email"
        name="email"
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
          value={formData.cpf}
          onChange={handleChange}
          error={errors.cpf}
          disabled={isLoading}
          helpText="Somente no cadastro"
        />
      )}

      <Input
        label="Telefone"
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        disabled={isLoading}
      />

      <Input
        label="Endereço"
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        disabled={isLoading}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} fullWidth>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
