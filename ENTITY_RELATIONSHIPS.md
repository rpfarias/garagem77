# Mapa de Relacionamentos entre Entidades

## Diagrama de Relacionamentos

```
┌─────────────────────────────────────────────────────────────────┐
│                         COMPANY (Tenant)                         │
│                                                                   │
│  1 ──────────────────────────────────────────────────────── ∞    │
│                         (has many)                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ companyId
                            ▼
                          USER

┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER                                  │
│                                                                   │
│  1 ──────────────────────────────────────────────────────── ∞    │
│         │              (has many vehicles)                       │
│         │                                                         │
│         │    ┌──────────────────────────────┐                    │
│         │    ▼                              ▼                    │
│         │  VEHICLE                    SCHEDULE                   │
│         │    │                              │                    │
│         │    │ customerId                   │ customerId         │
│         │    │                              │ vehicleId          │
│         │    │          ┌────────────────────                    │
│         │    │          │                                        │
│         │    │      @OneToMany (Schedule)                       │
│         │    │      from Vehicle.id                             │
│         │    │                                                  │
│         │    └──────────────────────────────────────            │
│         │                         (has many Orders)             │
│         │                                                        │
│         └───────────────────────────────────────────            │
│                      (has many Orders)                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                customerId, vehicleId
                            ▼
                          ORDER
                    (compra de serviços)
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
            ORDER_ITEM   PAYMENT   (LinkedTo)
                 │                   SCHEDULE
         ┌───────┼───────┐
         ▼       ▼       ▼
       SERVICE PRODUCT
         │        │
         │        │ productId
         │        ▼
         │    PRODUCT_MOVEMENT
         │        (Entrada/Saída)
         │
         └─────────────────────────

┌─────────────────────────────────────────────────────────────────┐
│                    LOYALTY PROGRAM                               │
│                                                                   │
│  1 ──────────────────────────────────────────────────────── ∞    │
│                      (has many points)                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                         programId
                            ▼
                      LOYALTY_POINT
                   (pontos por cliente)
                            │
                      loyaltyPointId
                            ▼
                    LOYALTY_TRANSACTION
```

---

## Relacionamentos Detalhados

| De | Para | Tipo | Via | Status |
|----|------|------|-----|--------|
| **Company** | User | 1:N | companyId | ❌ Sem @OneToMany/@ManyToOne |
| **Customer** | Vehicle | 1:N | customerId | ❌ Sem @OneToMany/@ManyToOne |
| **Customer** | Schedule | 1:N | customerId | ❌ Sem @OneToMany/@ManyToOne |
| **Customer** | Order | 1:N | customerId | ❌ Sem @OneToMany/@ManyToOne |
| **Customer** | LoyaltyPoint | 1:N | customerId | ❌ Sem @OneToMany/@ManyToOne |
| **Vehicle** | Schedule | 1:N | vehicleId | ❌ Sem @OneToMany/@ManyToOne |
| **Vehicle** | Order | 1:N | vehicleId | ❌ Sem @OneToMany/@ManyToOne |
| **Service** | Schedule | 1:N | serviceId | ❌ Sem @OneToMany/@ManyToOne |
| **Service** | OrderItem | 1:N | serviceId | ❌ Sem @OneToMany/@ManyToOne |
| **Schedule** | Order | 1:1 | scheduleId | ❌ Sem @OneToOne |
| **Order** | OrderItem | 1:N | orderId | ❌ Sem @OneToMany/@ManyToOne |
| **Order** | Payment | 1:N | orderId | ❌ Sem @OneToMany/@ManyToOne |
| **Product** | OrderItem | 1:N | productId | ❌ Sem @OneToMany/@ManyToOne |
| **Product** | ProductMovement | 1:N | productId | ❌ Sem @OneToMany/@ManyToOne |
| **LoyaltyProgram** | LoyaltyPoint | 1:N | programId | ❌ Sem @OneToMany/@ManyToOne |
| **LoyaltyPoint** | LoyaltyTransaction | 1:N | loyaltyPointId | ❌ Sem @OneToMany/@ManyToOne |

---

## Por que sem relacionamentos explícitos?

### ✅ Vantagens (Abordagem Atual)
- Evita **Lazy Loading Issues** (entidades não carregadas quando acessadas)
- Reduz risco de **N+1 Query Problem**
- Entidades mais simples e leves
- Melhor controle com Repositories (buscas explícitas)
- Sem problemas de serialização circular em APIs REST

### ❌ Desvantagens
- Menos "elegância" no código ORM
- Precisa fazer queries manuais para relacionamentos
- Menos validação automática de integridade referencial em Java

---

## Recomendação

**Manter a abordagem atual** (sem @OneToMany/@ManyToOne) porque:

1. **APIs REST não precisam de relacionamentos bidirecionais**
2. **DTOs já trazem os dados que precisa** (com publicIds)
3. **Evita problemas de performance em produção**
4. **Queries explícitas são mais claras e debugáveis**

Se precisar de relacionamentos futuramente, adicione apenas onde necessário (ex: @OneToMany lazy=false com @Fetch(FetchMode.JOIN)).

---

## Próximas ações

- [ ] Criar **Repositories** (estenderão JpaRepository)
- [ ] Criar **Services** (contêm a lógica de negócio)
- [ ] Criar **Controllers** (endpoints REST)
- [ ] Implementar **Validações customizadas** nos Services
