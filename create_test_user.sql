-- ============================================
-- Script para criar EMPRESA e USUÁRIO de TESTE
-- ============================================
-- Senha: password123
-- Email: admin@garagem77.com
-- Role: ADMIN
-- ============================================

-- 1. Criar Empresa (Tenant)
INSERT INTO public.tenants (id, slug, name, email, phone, plan_type, active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'garagem77-test',
    'Garagem77 Test',
    'admin@garagem77.com',
    '11999999999',
    'basic',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 2. Pegar o ID da empresa criada e inserir usuário
INSERT INTO public.users (id, tenant_id, email, password, name, role, active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    id,
    'admin@garagem77.com',
    '$2a$12$rCmyePVfkAc3cONc8Ed23.LarZaQrJT./oJwEZtGeR/I1WB1OnhNW',
    'Administrador',
    'ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM public.tenants
WHERE slug = 'garagem77-test'
AND NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE email = 'admin@garagem77.com'
);

-- ============================================
-- Verificar dados criados
-- ============================================
SELECT '--- TENANTS ---' AS "Resultado";
SELECT id, slug, name, email, active FROM public.tenants WHERE slug = 'garagem77-test';

SELECT '--- USERS ---' AS "Resultado";
SELECT id, email, name, role, active FROM public.users WHERE email = 'admin@garagem77.com';
