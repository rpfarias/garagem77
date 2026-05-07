'use client';

import React, { useEffect, useState } from 'react';
import { Product, CreateProductDTO } from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    unitPrice: '',
    quantityStock: '',
    minimumQuantity: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        unitPrice: product.unitPrice ? String(product.unitPrice) : '',
        quantityStock: String(product.quantityStock ?? ''),
        minimumQuantity: String(product.minimumQuantity ?? ''),
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter ao menos 3 caracteres';
    }

    const priceNum = parseFloat(formData.unitPrice.replace(',', '.'));
    if (!formData.unitPrice.trim()) {
      newErrors.unitPrice = 'Preço é obrigatório';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.unitPrice = 'Preço deve ser maior que 0';
    }

    if (!isEditing) {
      const stockNum = parseInt(formData.quantityStock);
      if (formData.quantityStock === '') {
        newErrors.quantityStock = 'Estoque inicial é obrigatório';
      } else if (isNaN(stockNum) || stockNum < 0) {
        newErrors.quantityStock = 'Estoque deve ser >= 0';
      }
    }

    const minNum = parseInt(formData.minimumQuantity);
    if (!formData.minimumQuantity.trim()) {
      newErrors.minimumQuantity = 'Estoque mínimo é obrigatório';
    } else if (isNaN(minNum) || minNum < 1) {
      newErrors.minimumQuantity = 'Mínimo deve ser >= 1';
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
      const priceNum = parseFloat(formData.unitPrice.replace(',', '.'));
      const minNum = parseInt(formData.minimumQuantity);

      if (isEditing) {
        const params = new URLSearchParams();
        if (formData.name) params.append('name', formData.name);
        if (formData.description) params.append('description', formData.description);
        if (formData.sku) params.append('sku', formData.sku);
        params.append('unitPrice', String(priceNum));
        params.append('minimumQuantity', String(minNum));

        await apiClient.put<Product>(`/products/${product!.id}?${params.toString()}`);
        toast.success('Produto atualizado');
      } else {
        const dto: CreateProductDTO = {
          name: formData.name,
          description: formData.description || undefined,
          sku: formData.sku || undefined,
          unitPrice: priceNum,
          quantityStock: parseInt(formData.quantityStock),
          minimumQuantity: minNum,
        };
        await apiClient.post<Product>('/products', dto);
        toast.success('Produto cadastrado');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <Input
          label="Nome do produto"
          type="text"
          name="name"
          placeholder="Ex: Cera para carroceria"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={isLoading}
          maxLength={255}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            rows={2}
            maxLength={500}
            placeholder="Detalhes do produto..."
            className="w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 placeholder-slate-400 bg-white border border-slate-200 shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="SKU"
            type="text"
            name="sku"
            placeholder="ABC-001"
            value={formData.sku}
            onChange={handleChange}
            disabled={isLoading}
            maxLength={100}
            helpText="Código único do produto (opcional)"
          />

          <Input
            label="Preço unitário"
            type="text"
            inputMode="decimal"
            name="unitPrice"
            placeholder="29,90"
            value={formData.unitPrice}
            onChange={handleChange}
            error={errors.unitPrice}
            disabled={isLoading}
            leftIcon={<span className="text-slate-500 text-sm font-medium">R$</span>}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isEditing && (
            <Input
              label="Estoque inicial"
              type="number"
              name="quantityStock"
              placeholder="0"
              value={formData.quantityStock}
              onChange={handleChange}
              error={errors.quantityStock}
              disabled={isLoading}
              min="0"
              helpText="Quantidade atual em estoque"
            />
          )}

          <Input
            label="Estoque mínimo"
            type="number"
            name="minimumQuantity"
            placeholder="5"
            value={formData.minimumQuantity}
            onChange={handleChange}
            error={errors.minimumQuantity}
            disabled={isLoading}
            min="1"
            helpText="Alerta quando atingir este nível"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
        </Button>
      </div>
    </form>
  );
}
