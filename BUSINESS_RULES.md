# Regras de Negócio - Garagem77 CRM

## 1. Autenticação e Autorização

### 1.1 Usuários e Roles
- **SUPER_ADMIN**: Acesso total à plataforma (gerencia tenants, planos)
- **ADMIN**: Dono da empresa/tenant (gerencia usuários e dados da empresa)
- **OPERADOR**: Funcionário (acesso restrito conforme módulo)

### 1.2 JWT Token
- Expiração: 24 horas (86400000ms)
- Algoritmo: HS512
- Claims armazenados: email, userId, userPublicId, role, companyId
- Obrigatório em todas as requisições (exceto login, cadastro de empresas, endpoints públicos)

### 1.3 Acesso por Tenant
- Cada usuário está vinculado a um único tenant (empresa)
- Dados de um tenant nunca podem ser acessados por outro tenant
- Validação deve ocorrer em cada requisição

---

## 2. Clientes e Veículos

### 2.1 Cliente
- CPF deve ser único por tenant
- CPF deve ter exatamente 11 dígitos (sem máscara)
- Email é opcional mas recomendado para contato
- Telefone é obrigatório
- Campo `active` controla se cliente pode receber agendamentos
- **Regra**: Cliente com veículos NÃO pode ser deletado (apenas desativado)

### 2.2 Veículo
- Placa deve ser única por tenant
- Placa: formato padrão brasileiro (ABC-1234)
- Modelo é obrigatório
- Cor é opcional
- Ano do modelo (modelYear) é opcional
- Marca é opcional
- Observações: campo livre para anotações
- **Regra**: Um cliente pode ter múltiplos veículos
- **Regra**: Veículos devem estar associados a um cliente ativo

---

## 3. Serviços (Catálogo)

### 3.1 Definição
- Nome deve ser único por tenant
- Preço deve ser maior que 0
- Duração em minutos (opcional, para controle de agenda)
- Descrição é opcional
- Campo `active` controla disponibilidade para novos agendamentos
- **Regra**: Serviço com preço zerado ou negativo é rejeitado
- **Regra**: Serviço pode ser desativado sem afetar agendamentos históricos

---

## 4. Agendamentos

### 4.1 Status de Agendamento
- **SCHEDULED**: Agendado, aguardando execução
- **IN_PROGRESS**: Em execução
- **COMPLETED**: Finalizado
- **CANCELLED**: Cancelado

### 4.2 Regras
- Data/hora do agendamento deve ser no futuro
- Um cliente pode ter múltiplos agendamentos simultâneos (mesmo horário)
- Um veículo pode ter múltiplos agendamentos simultâneos
- **Regra**: Transição permitida: SCHEDULED → IN_PROGRESS → COMPLETED
- **Regra**: SCHEDULED ou IN_PROGRESS podem ser cancelados → CANCELLED
- **Regra**: Agendamento COMPLETED ou CANCELLED não pode ser alterado
- **Regra**: Ao criar OS a partir de agendamento, agendamento passa para IN_PROGRESS automaticamente

---

## 5. Ordem de Serviço (OS)

### 5.1 Status da OS
- **PENDING**: Aguardando execução
- **IN_PROGRESS**: Em execução
- **COMPLETED**: Finalizada
- **CANCELLED**: Cancelada

### 5.2 Estrutura
- Uma OS pode ter múltiplos itens (OrderItem)
- Cada item contém: serviço OU produto (não obrigatoriamente ambos)
- Quantidade mínima por item: 1
- **Regra**: Total é calculado automaticamente = soma(quantidade × preço_unitário) - desconto

### 5.3 Itens da OS
- **Serviço**: quantidade = 1 (padrão), preço = preço_do_serviço
- **Produto**: quantidade ≥ 1, preço = preço_unitário × quantidade
- **Regra**: Aviso se tentar vender produto sem estoque (mas permite a venda)
- **Aviso**: Estoque deve ser decrementado ao adicionar item com produto
- **Regra**: Estoque pode ir negativo (venda sem cobertura permite-se com aviso)

### 5.4 Desconto
- Dois tipos: **FIXED** (valor fixo) ou **PERCENTAGE** (percentual)
- Desconto não pode ser maior que total da OS
- Desconto percentual: 0-100%
- **Regra**: Desconto é validado antes de calcular finalAmount
- finalAmount = total - desconto

### 5.5 Transições de Status
- PENDING → IN_PROGRESS → COMPLETED
- Qualquer status anterior → CANCELLED (se nenhum pagamento foi processado)
- **Regra**: OS COMPLETED ou CANCELLED não pode receber novos itens
- **Regra**: OS não pode ser CANCELLED se já tem pagamento PAID

### 5.6 Relacionamentos
- Vinculada a: 1 Cliente, 1 Veículo
- Pode ter: 1 Agendamento (origem) ou nenhum (OS avulsa)

---

## 6. Pagamentos

### 6.1 Métodos de Pagamento
- **PIX**: Transferência imediata
- **DINHEIRO**: Pagamento em espécie
- **CARTAO_CREDITO**: Cartão de crédito
- **CARTAO_DEBITO**: Cartão de débito

### 6.2 Status do Pagamento
- **PENDING**: Aguardando processamento
- **PAID**: Processado com sucesso
- **FAILED**: Falhou na processamento
- **CANCELLED**: Cancelado

### 6.3 Regras
- Valor do pagamento ≤ valor_ainda_devido_na_OS
- **Múltiplos pagamentos** são permitidos para uma mesma OS
- **Regra**: Quando soma(pagamentos PAID) = total_OS → OS passa para COMPLETED automaticamente
- **Regra**: Pagamento PAID não pode ser revertido (apenas cancelado após criação)
- **Regra**: Data do pagamento deve ser ≤ data atual
- transaction_id é opcional (para referência de integração com gateway)

### 6.4 Cálculos
- Valor_devido = total - soma(pagamentos anteriores PAID)
- OS está **quitada** quando: soma(PAID) = finalAmount

---

## 7. Produtos e Estoque

### 7.1 Produto
- SKU deve ser único por tenant
- Preço unitário > 0
- Quantidade em estoque pode ser negativa
- Quantidade mínima para alerta (minimumQuantity)
- **Regra**: Produto com preço ≤ 0 é rejeitado
- Campo `active` controla se pode ser usado em novas OS

### 7.2 Movimentações de Estoque
- Tipo: **ENTRADA** (compra, devolução) ou **SAÍDA** (venda, quebra)
- reference_id: referência para qual OS/transação relacionada
- Notas: campo livre para comentários
- **Regra**: Movimentação é imutável (não pode ser editada, apenas consultada)
- **Regra**: Estoque final = estoque_inicial + entradas - saídas

### 7.3 Alertas de Estoque
- Se quantidade < minimumQuantity → Gerar alerta
- Alerta é informativo, não bloqueia venda

---

## 8. Programa de Fidelidade (Loyalty)

### 8.1 Programa
- Um programa de fidelidade por tenant
- Apenas **um programa ativo** por vez
- Taxa: pontos por real gasto (ex: 1 ponto = 1 real)
- **Regra**: Ao ativar novo programa, programa anterior é desativado

### 8.2 Pontos do Cliente
- Acúmulo: para cada OS COMPLETED, adicionar pontos = finalAmount × taxa
- Pontos são saldo (não expiram)
- **Regra**: Resgate de pontos deve ter saldo suficiente

### 8.3 Histórico de Transações
- **EARN**: Ganho de pontos (ao completar OS)
- **REDEEM**: Resgate de pontos (manualmente por operador)
- Cada transação é imutável
- Descrição: campo livre para contexto

### 8.4 Configuração
- Ativar/desativar programa não afeta pontos existentes
- Mudança de taxa só afeta novos pontos

---

## 9. Multi-Tenancy

### 9.1 Isolamento
- Cada tenant tem schema PostgreSQL próprio
- Dados públicos (tenants, users) em schema `public`
- Dados operacionais em schema `tenant_{slug}`

### 9.2 Validação
- Toda requisição deve incluir tenant_id (via token JWT)
- Validar que usuário pertence ao tenant antes de acessar dados
- Erro 403 se acesso negado

---

## 10. Validações Gerais

### 10.1 Datas
- Data futura: agendamento, data da OS
- Data passada ou presente: pagamento, movimentação

### 10.2 CPF
- Exatamente 11 dígitos
- Sem máscara
- Único por tenant

### 10.3 Placa
- Formato: ABC-1234 (3 letras, hífen, 4 números)
- Único por tenant

### 10.4 Email
- Formato válido (RFC 5322 básico)
- Único por tenant (usuários)

---

## 11. Respostas de Erro

### Códigos HTTP
- **400**: Violação de regra de negócio (BusinessRuleException)
- **404**: Recurso não encontrado (ResourceNotFoundException)
- **409**: Conflito, recurso duplicado (DuplicateResourceException)
- **401**: Não autorizado, JWT inválido/ausente
- **403**: Acesso proibido (tenant diferente)
- **500**: Erro interno

---

**Versão**: 1.0  
**Data**: 2026-05-05  
**Status**: Documentado
