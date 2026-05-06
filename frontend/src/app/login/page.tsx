'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(email, password);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Falha ao fazer login. Verifique suas credenciais.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">Garagem77</h1>
              <p className="text-xs text-slate-500">CRM Profissional</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-slate-600">
              Acesse sua conta para gerenciar seu negócio
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoading}
              autoComplete="email"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  Esqueceu sua senha?
                </a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">Credenciais de demonstração</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Email:</span>
                    <code className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700">
                      admin@garagem77.com
                    </code>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Senha:</span>
                    <code className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-700">
                      password123
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            © 2026 Garagem77. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Pattern grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 text-white">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
              <span className="text-xs font-medium">Sistema online</span>
            </div>

            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Gerencie seu lava jato com inteligência
            </h2>
            <p className="text-lg text-primary-100/90 leading-relaxed">
              Organize agendamentos, controle estoque, fidelize clientes e
              acompanhe seu faturamento em tempo real.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-4">
              <FeatureCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                label="Cadastros"
              />
              <FeatureCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="Agenda"
              />
              <FeatureCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                label="Relatórios"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
      <div className="text-primary-200">{icon}</div>
      <span className="text-xs font-medium text-white/90">{label}</span>
    </div>
  );
}
