'use client';

import React, { useEffect, useState } from 'react';
import {
  Customer,
  Vehicle,
  Service,
  Product,
  Order,
  CreateOrderDTO,
  CreateOrderItemDTO,
} from '@/types';
import { apiClient } from '@/services/api';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PlusIcon, TrashIcon } from '@/components/Icons';
import toast from 'react-hot-toast';

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ItemRow {
  type: 'SERVICE' | 'PRODUCT';
  refId: string;
  quantity: string;
  unitPrice: string;
}

export function OrderForm({ order, onSuccess, onCancel }: OrderFormProps) {
  const isEditing = !!order;
  const [isLoading, setIsLoading] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { type: 'SERVICE', refId: '', quantity: '1', unitPrice: '' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load reference data
  useEffect(() => {
    if (isEditing) return;
    setLoadingLists(true);
    Promise.all([
      apiClient.get<Customer[]>('/customers?paged=false'),
      apiClient.get<{ content: Service[] } | Service[]>('/services?paged=false'),
      apiClient.get<{ content: Product[] } | Product[]>('/products?paged=false'),
    ])
      .then(([cust, svc, prod]) => {
        setCustomers(cust || []);
        setServices(Array.isArray(svc) ? svc : (svc as any)?.content || []);
        setProducts(Array.isArray(prod) ? prod : (prod as any)?.content || []);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoadingLists(false));
  }, [isEditing]);

  // Load vehicles when customer changes
  useEffect(() => {
    if (!customerId) {
      setVehicles([]);
      setVehicleId('');
      return;
    }
    apiClient
      .get<Vehicle[]>(`/vehicles/customer/${customerId}`)
      .then((data) => setVehicles(data || []))
      .catch(() => toast.error('Erro ao carregar veículos'));
  }, [customerId]);

  // Auto-fill price when service or product is selected
  const updateItem = (idx: number, patch: Partial<ItemRow>) => {
    setItems((prev) => {
      const next = [...prev];
      const updated = { ...next[idx], ...patch };

      // Auto-fill unitPrice
      if (patch.refId && updated.refId) {
        if (updated.type === 'SERVICE') {
          const svc = services.find((s) => s.id === updated.refId);
          if (svc) updated.unitPrice = String(svc.price);
        } else {
          const prod = products.find((p) => p.id === updated.refId);
          if (prod) updated.unitPrice = String(prod.unitPrice);
        }
      }

      // Reset refId if type changes
      if (patch.type) {
        updated.refId = '';
        updated.unitPrice = '';
      }

      next[idx] = updated;
      return next;
    });
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { type: 'SERVICE', refId: '', quantity: '1', unitPrice: '' },
    ]);

  const removeItem = (idx: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!customerId) e.customerId = 'Selecione um cliente';
    if (!vehicleId) e.vehicleId = 'Selecione um veículo';

    items.forEach((it, idx) => {
      if (!it.refId) e[`item_${idx}_ref`] = 'Selecione';
      const qty = parseInt(it.quantity);
      if (isNaN(qty) || qty < 1) e[`item_${idx}_qty`] = 'Inválido';
      const price = parseFloat(it.unitPrice.replace(',', '.'));
      if (isNaN(price) || price <= 0) e[`item_${idx}_price`] = 'Inválido';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const dto: CreateOrderDTO = {
        customerId,
        vehicleId,
        notes: notes || undefined,
        items: items.map((it): CreateOrderItemDTO => ({
          serviceId: it.type === 'SERVICE' ? it.refId : undefined,
          productId: it.type === 'PRODUCT' ? it.refId : undefined,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice.replace(',', '.')),
        })),
      };
      await apiClient.post<Order>('/orders', dto);
      toast.success('Pedido criado com sucesso');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar pedido');
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = (hasError: boolean) =>
    `w-full px-3.5 py-2.5 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border shadow-sm transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 dark:disabled:bg-slate-800/60 disabled:cursor-not-allowed ${
      hasError ? 'border-danger-300 dark:border-danger-700' : 'border-slate-200 dark:border-slate-700'
    }`;

  // Calculate total preview
  const totalPreview = items.reduce((sum, it) => {
    const qty = parseInt(it.quantity) || 0;
    const price = parseFloat(it.unitPrice.replace(',', '.')) || 0;
    return sum + qty * price;
  }, 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  if (isEditing) {
    return (
      <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
        A edição completa de pedidos não está disponível. Use as ações de status na lista.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cliente</label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={isLoading || loadingLists}
            className={selectClass(!!errors.customerId)}
          >
            <option value="">{loadingLists ? 'Carregando...' : 'Selecione'}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <span className="text-xs text-danger-600 dark:text-danger-400">{errors.customerId}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Veículo</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={isLoading || !customerId}
            className={selectClass(!!errors.vehicleId)}
          >
            <option value="">
              {!customerId
                ? 'Selecione um cliente primeiro'
                : vehicles.length === 0
                ? 'Sem veículos'
                : 'Selecione'}
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate} — {v.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <span className="text-xs text-danger-600 dark:text-danger-400">{errors.vehicleId}</span>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Items do pedido</label>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={addItem}
            disabled={isLoading}
            leftIcon={<PlusIcon className="w-3.5 h-3.5" />}
          >
            Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center gap-2">
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateItem(idx, { type: e.target.value as 'SERVICE' | 'PRODUCT' })
                  }
                  disabled={isLoading}
                  className="px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="SERVICE">Serviço</option>
                  <option value="PRODUCT">Produto</option>
                </select>

                <select
                  value={item.refId}
                  onChange={(e) => updateItem(idx, { refId: e.target.value })}
                  disabled={isLoading}
                  className={`flex-1 px-2 py-1.5 rounded-md text-sm border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
                    errors[`item_${idx}_ref`] ? 'border-danger-300 dark:border-danger-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <option value="">Selecione</option>
                  {item.type === 'SERVICE'
                    ? services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    : products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.quantityStock} em estoque)
                        </option>
                      ))}
                </select>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 rounded text-slate-400 dark:text-slate-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/40 transition-colors"
                    title="Remover item"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, { quantity: e.target.value })}
                  disabled={isLoading}
                  placeholder="Qtd"
                  className={`px-2 py-1.5 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border ${
                    errors[`item_${idx}_qty`] ? 'border-danger-300 dark:border-danger-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                <div className="col-span-2 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, { unitPrice: e.target.value })}
                    disabled={isLoading}
                    placeholder="0,00"
                    className={`w-full pl-8 pr-2 py-1.5 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border ${
                      errors[`item_${idx}_price`] ? 'border-danger-300 dark:border-danger-700' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
              </div>

              {(parseInt(item.quantity) || 0) > 0 &&
                (parseFloat(item.unitPrice.replace(',', '.')) || 0) > 0 && (
                  <p className="text-xs text-right text-slate-600 dark:text-slate-400 font-medium">
                    Subtotal:{' '}
                    {formatPrice(
                      (parseInt(item.quantity) || 0) *
                        (parseFloat(item.unitPrice.replace(',', '.')) || 0)
                    )}
                  </p>
                )}
            </div>
          ))}
        </div>

        {totalPreview > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900/60 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Total estimado</span>
            <span className="text-lg font-bold text-primary-700 dark:text-primary-300 tabular-nums">
              {formatPrice(totalPreview)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          rows={2}
          maxLength={500}
          placeholder="Detalhes adicionais..."
          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Criar pedido
        </Button>
      </div>
    </form>
  );
}
