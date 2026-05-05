# Diagrama UML - Entidades e Relacionamentos

## Diagrama de Entidades (ER Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC SCHEMA (Global)                           │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │    COMPANIES     │
    ├──────────────────┤
    │ id (PK)          │
    │ publicId (UUID)  │
    │ slug (UNIQUE)    │
    │ name             │
    │ email (UNIQUE)   │
    │ phone            │
    │ planType         │
    │ schemaName       │
    │ active           │
    │ createdAt        │
    │ updatedAt        │
    └──────────────────┘
           │ 1
           │ (companyId)
           │
           ▼ *
    ┌──────────────────┐
    │     USERS        │
    ├──────────────────┤
    │ id (PK)          │
    │ publicId (UUID)  │
    │ email (UNIQUE)   │
    │ password         │
    │ name             │
    │ role             │ (SUPER_ADMIN, ADMIN, OPERADOR)
    │ companyId (FK)   │
    │ active           │
    │ createdAt        │
    │ updatedAt        │
    └──────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    TENANT SCHEMA (tenant_{slug})                        │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │   CUSTOMERS      │
    ├──────────────────┤
    │ id (PK)          │
    │ publicId (UUID)  │
    │ cpf (UNIQUE)     │
    │ name             │
    │ email            │
    │ phone            │
    │ birthDate        │
    │ address          │
    │ active           │
    │ createdAt        │
    │ updatedAt        │
    └──────────────────┘
           │ 1
           │
           ▼ *
    ┌──────────────────┐
    │    VEHICLES      │
    ├──────────────────┤
    │ id (PK)          │
    │ publicId (UUID)  │
    │ customerId (FK)  │
    │ plate (UNIQUE)   │
    │ model            │
    │ brand            │
    │ color            │
    │ modelYear        │
    │ observations     │
    │ active           │
    │ createdAt        │
    │ updatedAt        │
    └──────────────────┘
```

## Relacionamentos - Resumo

### Public Schema
- COMPANIES 1:N USERS (uma empresa tem múltiplos usuários)

### Tenant Schema  
- CUSTOMERS 1:N VEHICLES (um cliente tem múltiplos veículos)
- CUSTOMERS 1:N SCHEDULES (um cliente tem múltiplos agendamentos)
- CUSTOMERS 1:N ORDERS (um cliente tem múltiplas OS)
- CUSTOMERS 1:N LOYALTY_POINTS (um cliente tem pontos)

- VEHICLES N:1 CUSTOMERS (um veículo pertence a um cliente)
- VEHICLES 1:N SCHEDULES (um veículo pode ter agendamentos)
- VEHICLES 1:N ORDERS (um veículo pode estar em OS)

- SERVICES 1:N SCHEDULES (um serviço pode ser agendado múltiplas vezes)
- SERVICES 1:N ORDER_ITEMS (um serviço pode estar em múltiplos itens)

- SCHEDULES N:1 CUSTOMERS (agendamento de um cliente)
- SCHEDULES N:1 VEHICLES (agendamento de um veículo)
- SCHEDULES N:1 SERVICES (agendamento de um serviço)
- SCHEDULES 0:1 ORDERS (agendamento pode gerar uma OS)

- ORDERS 1:N ORDER_ITEMS (uma OS tem múltiplos itens)
- ORDERS 1:N PAYMENTS (uma OS pode ter múltiplos pagamentos)
- ORDERS N:1 CUSTOMERS (OS de um cliente)
- ORDERS N:1 VEHICLES (OS de um veículo)
- ORDERS 0:1 SCHEDULES (OS pode ter origem em agendamento)

- ORDER_ITEMS N:1 ORDERS (item pertence a uma OS)
- ORDER_ITEMS N:0 SERVICES (item pode referenciar serviço)
- ORDER_ITEMS N:0 PRODUCTS (item pode referenciar produto)

- PRODUCTS 1:N ORDER_ITEMS (produto pode estar em múltiplos itens)
- PRODUCTS 1:N PRODUCT_MOVEMENTS (produto pode ter múltiplas movimentações)

- PRODUCT_MOVEMENTS N:1 PRODUCTS (movimentação de um produto)

- PAYMENTS N:1 ORDERS (pagamento de uma OS)

- LOYALTY_PROGRAMS 1:N LOYALTY_POINTS (programa tem múltiplos clientes)
- LOYALTY_POINTS N:1 CUSTOMERS (pontos de um cliente)
- LOYALTY_POINTS 1:N LOYALTY_TRANSACTIONS (pontos podem ter múltiplas transações)
- LOYALTY_TRANSACTIONS N:1 LOYALTY_POINTS (transação de uma conta de pontos)
- LOYALTY_TRANSACTIONS N:0 ORDERS (transação pode referenciar OS)

---

## Índices por Performance

### CUSTOMERS
- idx_customer_cpf (UNIQUE) - Busca por CPF
- idx_customer_email - Busca por email

### VEHICLES
- idx_vehicle_plate (UNIQUE) - Busca por placa
- idx_vehicle_customer_id - Relacionamento com cliente

### SERVICES
- idx_service_name (UNIQUE) - Busca por nome

### SCHEDULES
- idx_schedule_customer_id - Agendamentos por cliente
- idx_schedule_vehicle_id - Agendamentos por veículo
- idx_schedule_scheduled_at - Ordenação cronológica
- idx_schedule_status - Filtro por status

### ORDERS
- idx_order_customer_id - OS por cliente
- idx_order_vehicle_id - OS por veículo
- idx_order_status - Filtro por status
- idx_order_created_at - Filtro por período

### PAYMENTS
- idx_payment_order_id - Pagamentos por OS
- idx_payment_status - Filtro por status

### PRODUCTS
- idx_product_sku (UNIQUE) - Busca por SKU

### PRODUCT_MOVEMENTS
- idx_product_movement_product_id - Histórico por produto

### LOYALTY
- idx_loyalty_point_customer_id - Pontos por cliente
- idx_loyalty_transaction_loyalty_point_id - Histórico de transações

### USERS (PUBLIC SCHEMA)
- idx_user_email (UNIQUE) - Autenticação
- idx_user_company_id - Usuários por empresa

---

## Constraints de Integridade

### NOT NULL Obrigatórios
- CUSTOMERS: cpf, name, phone, active
- VEHICLES: customerId, plate, model, active
- SERVICES: name, price, active
- SCHEDULES: customerId, vehicleId, serviceId, scheduledAt, status
- ORDERS: customerId, vehicleId, status, totalAmount, finalAmount
- ORDER_ITEMS: orderId, quantity, unitPrice, subtotal
- PRODUCTS: name, price, quantityStock, minimumQuantity, active
- PAYMENTS: orderId, amount, paymentMethod, status
- USERS: email, password, name, role, companyId, active
- LOYALTY_PROGRAMS: name, pointsPerReal, active
- LOYALTY_POINTS: customerId, programId, pointsBalance

### UNIQUE Constraints
- COMPANIES: slug, email
- CUSTOMERS: cpf
- VEHICLES: plate
- SERVICES: name
- PRODUCTS: sku
- USERS: email

### Soft Delete
- Campo `active` (BOOLEAN) em entidades que podem ser deletadas
- DELETE físico nunca é executado
- Queries filtram `WHERE active = true` por padrão

---

## Campos Padrão em Todas as Entidades

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | Chave primária, auto-incrementada (interno) |
| publicId | UUID | Identificador público para APIs |
| createdAt | TIMESTAMP(6) | Data/hora de criação (imutável) |
| updatedAt | TIMESTAMP(6) | Data/hora da última alteração |

---

**Versão**: 1.0  
**Data**: 2026-05-05  
**Status**: Documentado
