'use client';

import React, { useEffect, useState } from 'react';
import { Company, User } from '@/types';
import { useFetch } from '@/hooks/useFetch';
import { apiClient } from '@/services/api';
import { Layout } from '@/components/Layout';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import {
  SettingsIcon,
  UsersIcon,
  CheckCircleIcon,
  SparkleIcon,
  LogoutIcon,
} from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Section = 'COMPANY' | 'PROFILE' | 'SECURITY' | 'SYSTEM';

const NAV_ITEMS: { key: Section; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'COMPANY',
    label: 'Empresa',
    description: 'Dados da sua empresa',
    icon: <SparkleIcon className="w-4 h-4" />,
  },
  {
    key: 'PROFILE',
    label: 'Perfil',
    description: 'Suas informações',
    icon: <UsersIcon className="w-4 h-4" />,
  },
  {
    key: 'SECURITY',
    label: 'Segurança',
    description: 'Senha e acesso',
    icon: <CheckCircleIcon className="w-4 h-4" />,
  },
  {
    key: 'SYSTEM',
    label: 'Sistema',
    description: 'Sobre o aplicativo',
    icon: <SettingsIcon className="w-4 h-4" />,
  },
];

// ============================================================================
// COMPANY SECTION
// ============================================================================

function CompanySection() {
  const { data: company, isLoading, refetch } = useFetch<Company>('/companies/me');
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name.trim()) e2.name = 'Nome obrigatório';
    if (!form.email.trim()) e2.email = 'Email obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e2.email = 'Email inválido';
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setIsSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('name', form.name);
      params.append('email', form.email);
      if (form.phone) params.append('phone', form.phone);
      await apiClient.put(`/companies/${company!.publicId}?${params.toString()}`);
      toast.success('Empresa atualizada com sucesso');
      setEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-8 text-center">Carregando...</p>;
  }

  if (!company) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Não foi possível carregar dados da empresa.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
          {company.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{company.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs font-mono text-slate-500">@{company.slug}</code>
            <span className="text-slate-300">•</span>
            <Badge variant={company.active ? 'success' : 'default'} dot>
              {company.active ? 'Ativa' : 'Inativa'}
            </Badge>
            <span className="text-slate-300">•</span>
            <Badge variant="primary">Plano {company.planType}</Badge>
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da empresa"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            disabled={isSaving}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            disabled={isSaving}
          />
          <Input
            label="Telefone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            disabled={isSaving}
            placeholder="(11) 99999-9999"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Salvar alterações
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <FieldRow label="Nome" value={company.name} />
          <FieldRow label="Email" value={company.email} />
          <FieldRow label="Telefone" value={company.phone || '—'} />
          <FieldRow label="Plano" value={company.planType} />
          <FieldRow label="Slug" value={`@${company.slug}`} mono />

          <div className="pt-4 border-t border-slate-100">
            <Button variant="primary" onClick={() => setEditing(true)}>
              Editar empresa
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROFILE SECTION
// ============================================================================

function ProfileSection() {
  const { data: user, isLoading, refetch } = useFetch<User>('/users/me');
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name.trim()) e2.name = 'Nome obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e2.email = 'Email inválido';
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    setIsSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('name', form.name);
      params.append('email', form.email);
      await apiClient.put(`/users/${user!.publicId}?${params.toString()}`);
      toast.success('Perfil atualizado');
      setEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500 py-8 text-center">Carregando...</p>;
  }

  if (!user) {
    return <p className="text-sm text-slate-500 py-8 text-center">Erro ao carregar perfil.</p>;
  }

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{user.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
            <span className="text-slate-300">•</span>
            <Badge variant="primary">{user.role}</Badge>
          </div>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            disabled={isSaving}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            disabled={isSaving}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Salvar alterações
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <FieldRow label="Nome" value={user.name} />
          <FieldRow label="Email" value={user.email} />
          <FieldRow label="Função" value={user.role} />
          <FieldRow
            label="Status"
            value={user.active || user.isActive ? 'Ativo' : 'Inativo'}
            valueClass={user.active || user.isActive ? 'text-success-700' : 'text-slate-500'}
          />

          <div className="pt-4 border-t border-slate-100">
            <Button variant="primary" onClick={() => setEditing(true)}>
              Editar perfil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SECURITY SECTION (Change Password)
// ============================================================================

function SecuritySection() {
  const { data: user } = useFetch<User>('/users/me');
  const { logout } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!oldPassword) e2.oldPassword = 'Obrigatório';
    if (!newPassword) e2.newPassword = 'Obrigatório';
    else if (newPassword.length < 6) e2.newPassword = 'Mínimo 6 caracteres';
    if (newPassword !== confirmPassword) e2.confirmPassword = 'Não confere com a nova senha';
    setErrors(e2);
    if (Object.keys(e2).length > 0) return;

    if (!user) {
      toast.error('Usuário não carregado');
      return;
    }

    setIsSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('oldPassword', oldPassword);
      params.append('newPassword', newPassword);
      await apiClient.post(`/users/${user.publicId}/change-password?${params.toString()}`);
      toast.success('Senha alterada com sucesso. Faça login novamente.');
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-warning-50/40 border border-warning-200/60 p-4">
        <p className="text-sm font-medium text-warning-900">Trocar senha</p>
        <p className="text-xs text-warning-800 mt-1">
          Após a alteração você será desconectado e precisará fazer login novamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Senha atual"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={errors.oldPassword}
          disabled={isSaving}
          autoComplete="current-password"
        />
        <Input
          label="Nova senha"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
          disabled={isSaving}
          helpText="Mínimo 6 caracteres"
          autoComplete="new-password"
        />
        <Input
          label="Confirme a nova senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          disabled={isSaving}
          autoComplete="new-password"
        />

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Alterar senha
          </Button>
        </div>
      </form>

      <div className="pt-6 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-900">Sessão</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Encerre sua sessão atual em todos os dispositivos.
        </p>
        <Button
          variant="secondary"
          onClick={() => logout()}
          leftIcon={<LogoutIcon className="w-4 h-4" />}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// SYSTEM SECTION
// ============================================================================

function SystemSection() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Sobre o sistema</h3>
        <div className="space-y-3">
          <FieldRow label="Aplicação" value="Garagem77 — CRM Profissional" />
          <FieldRow label="Versão" value="1.0.0" />
          <FieldRow label="Ambiente" value={process.env.NODE_ENV || 'development'} />
          <FieldRow label="API" value={apiUrl} mono />
        </div>
      </div>

      <div className="pt-5 border-t border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Módulos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            'Clientes',
            'Veículos',
            'Serviços',
            'Agendamentos',
            'Pedidos',
            'Pagamentos',
            'Produtos',
            'Fidelidade',
            'Relatórios',
          ].map((m) => (
            <div
              key={m}
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4 text-success-600 shrink-0" />
              <span className="text-sm text-slate-700">{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-5 border-t border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 mb-2">Documentação da API</h3>
        <p className="text-sm text-slate-500 mb-4">
          Acesse o Swagger UI para documentação interativa dos endpoints.
        </p>
        <a
          href={`${apiUrl.replace(/\/api$/, '')}/api/swagger-ui.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Abrir Swagger UI →
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER
// ============================================================================

function FieldRow({
  label,
  value,
  mono = false,
  valueClass = '',
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={clsx(
          'text-sm text-slate-900',
          mono && 'font-mono text-xs',
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('COMPANY');

  return (
    <Layout requireAuth>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Sidebar */}
        <Card className="lg:sticky lg:top-24 lg:self-start">
          <nav className="p-2">
            {NAV_ITEMS.map((item) => {
              const isActive = section === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={clsx(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={clsx(
                      'mt-0.5 shrink-0',
                      isActive ? 'text-primary-600' : 'text-slate-400'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span
                      className={clsx(
                        'block text-xs mt-0.5',
                        isActive ? 'text-primary-600/80' : 'text-slate-400'
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">
              {NAV_ITEMS.find((n) => n.key === section)?.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {NAV_ITEMS.find((n) => n.key === section)?.description}
            </p>
          </CardHeader>
          <CardBody>
            {section === 'COMPANY' && <CompanySection />}
            {section === 'PROFILE' && <ProfileSection />}
            {section === 'SECURITY' && <SecuritySection />}
            {section === 'SYSTEM' && <SystemSection />}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
