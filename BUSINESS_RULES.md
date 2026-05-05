# Regras de Negócio - Garagem77 CRM

## 1. CUSTOMER (Clientes)

- ✅ CPF deve ser único no sistema
- ✅ CPF deve ter exatamente 11 dígitos numéricos
- ✅ Email é opcional mas, se fornecido, deve ser válido
- ✅ Telefone é obrigatório
- ✅ Não pode deletar cliente que tem veículos ativos
- ✅ Não pode deletar cliente que tem agendamentos/ordens em aberto

## 2. VEHICLE (Veículos)

- ✅ Placa deve ser única no sistema
- ✅ Placa deve ter 7-10 caracteres (formato brasileiro)
- ✅ Um cliente pode ter múltiplos veículos
- ✅ Não pode deletar veículo com agendamentos em aberto
- ✅ Não pode deletar veículo com ordens em aberto
- ✅ Ao deletar cliente, deletar todos seus veículos (cascade)

## 3. SERVICE (Serviços/Catálogo)

- ✅ Nome deve ser único por empresa
- ✅ Preço deve ser > 0
- ✅ Duração é opcional mas recomendada
- ✅ Pode estar ativo/inativo
- ✅ Não pode deletar serviço que está em ordens/agendamentos

## 4. SCHEDULE (Agendamentos)

- ✅ Não pode agendar em data/hora passada
- ✅ Não pode agendar 2x o mesmo cliente + veículo + serviço no mesmo horário
- ✅ Cliente e veículo devem existir
- ✅ Serviço deve existir
- ✅ Status: SCHEDULED → COMPLETED ou CANCELLED
- ✅ Ao converter em Ordem, status muda para IN_PROGRESS
- ✅ Não pode cancelar agendamento com ordem em andamento
- ✅ Aviso: se horário + duração do serviço ultrapassar limite do dia (ex: 18h)

## 5. ORDER (Ordem de Serviço)

- ✅ Deve ter pelo menos 1 item (serviço OU produto)
- ✅ Total = SUM(orderItems.subtotal) - discountAmount
- ✅ Desconto não pode ser maior que o total
- ✅ Status: PENDING → IN_PROGRESS → COMPLETED ou CANCELLED
- ✅ Não pode editar ordem COMPLETED ou CANCELLED
- ✅ Ao criar ordem, cria automaticamente entry de LoyaltyTransaction (se cliente tem programa)
- ✅ Não pode cancelar ordem com pagamentos COMPLETED

## 6. ORDER ITEM (Itens da Ordem)

- ✅ Deve ter OU serviceId OU productId (pelo menos um)
- ✅ Subtotal = quantity × unitPrice
- ✅ Preço não pode ser negativo
- ✅ Quantidade mínima = 1
- ✅ Se usar produto, decrementa automaticamente do estoque
- ✅ Se não tiver estoque suficiente, retorna erro (ou permite venda com alerta?)

## 7. PAYMENT (Pagamentos)

- ✅ Uma ordem pode ter múltiplos pagamentos (ex: dinheiro + PIX)
- ✅ SUM(payments.amount) NÃO pode ultrapassar order.finalAmount
- ✅ Status: PENDING → COMPLETED ou FAILED ou CANCELLED
- ✅ TransactionId deve ser único (evitar duplicação)
- ✅ Métodos aceitos: PIX, DINHEIRO, CARTAO_CREDITO, CARTAO_DEBITO
- ✅ Quando SUM(payments COMPLETED) = order.finalAmount → order.status = COMPLETED
- ✅ Não pode deletar payment COMPLETED

## 8. PRODUCT (Produtos/Insumos)

- ✅ SKU deve ser único
- ✅ Preço > 0
- ✅ Quantidade não pode ser negativa
- ✅ Alerta: quando quantityStock < minimumQuantity
- ✅ Histórico de movimentações rastreável
- ✅ Pode estar ativo/inativo

## 9. PRODUCT MOVEMENT (Movimentação de Estoque)

- ✅ Tipos: ENTRADA, SAÍDA
- ✅ ENTRADA: aumenta quantityStock do produto
- ✅ SAÍDA: diminui quantityStock do produto
  - ⚠️ Não pode fazer SAÍDA se quantityStock < quantidade solicitada
- ✅ ReferenceId pode ser orderId (rastreamento)
- ✅ Histórico completo e imutável (não pode editar/deletar)

## 10. LOYALTY PROGRAM (Programa de Fidelidade)

- ✅ Um programa por empresa
- ✅ PointsPerReal padrão = 1.0 (1 ponto por real gasto)
- ✅ Pode estar ativo/inativo
- ✅ Ao desativar, customers continuam com saldo mas não ganham mais pontos

## 11. LOYALTY POINT (Saldo de Pontos)

- ✅ Um registro por cliente + programa
- ✅ Pontos nunca podem ser negativos
- ✅ Historicamente rastreável via LoyaltyTransaction
- ✅ SUM(transactions EARN) - SUM(transactions REDEEM) = pointsBalance

## 12. LOYALTY TRANSACTION (Histórico de Pontos)

- ✅ Tipos: EARN (ganho), REDEEM (resgate)
- ✅ EARN: 
  - Automático ao criar/completar Order
  - Pontos = order.finalAmount × program.pointsPerReal
- ✅ REDEEM:
  - Manual ou automático (depende do fluxo de cupom)
  - Não pode resgatar mais pontos que tem disponível
- ✅ OrderId linkado (rastreamento de que ordem gerou pontos)
- ✅ Histórico imutável

---

## Fluxos Principais

### Fluxo 1: Agendamento → Ordem → Pagamento
```
1. Cliente agenda serviço
   Schedule (SCHEDULED) criado
   
2. Operário executa serviço
   Schedule → IN_PROGRESS
   Ordem criada
   Ordem → IN_PROGRESS
   
3. Serviço concluído
   Ordem → PENDING (aguarda pagamento)
   Schedule → COMPLETED
   
4. Cliente paga
   Payment criado
   Se SUM(payments) == order.finalAmount → Ordem → COMPLETED
   LoyaltyTransaction EARN criado
```

### Fluxo 2: Controle de Estoque
```
1. Produto criado com quantityStock = 100
2. Ordem criada com 5 unidades do produto
   ProductMovement (SAÍDA) = -5
   Product.quantityStock = 95
3. Se quantityStock < minimumQuantity → Alerta
4. Entrada de estoque
   ProductMovement (ENTRADA) = +20
   Product.quantityStock = 115
```

### Fluxo 3: Fidelidade
```
1. Ordem com finalAmount = R$ 100
2. LoyaltyPoint (customerId, programId)
3. LoyaltyTransaction EARN criado
   pointsValue = 100 × 1.0 = 100 pontos
4. LoyaltyPoint.pointsBalance += 100
```

---

## Validações e Exceções

| Exceção | Quando | Ação |
|---------|--------|------|
| `DuplicateCpfException` | CPF já existe | Retornar 409 Conflict |
| `DuplicatePlateException` | Placa já existe | Retornar 409 Conflict |
| `ScheduleInPastException` | Agendar data passada | Retornar 400 Bad Request |
| `InsufficientStockException` | Não tem estoque | Retornar 400 Bad Request |
| `OrderNotEditableException` | Tentar editar COMPLETED/CANCELLED | Retornar 400 Bad Request |
| `ExceedsOrderAmountException` | Payment > order.finalAmount | Retornar 400 Bad Request |
| `InsufficientLoyaltyPointsException` | Tentar resgatar > balance | Retornar 400 Bad Request |
| `DependentRecordsException` | Deletar com dependências | Retornar 400 Bad Request |

---

## Decisões Confirmadas ✅

1. ✅ **OrderItem com quantidade > 1**: SIM - permite quantidade > 1 do mesmo produto
2. ✅ **Venda sem estoque**: SÓ ALERTA - não bloqueia a venda, apenas avisa
3. ✅ **Múltiplos pagamentos**: SIM - permite PIX + Dinheiro na mesma ordem
4. ✅ **Tipo de desconto**: OPÇÃO - FIXED (R$) ou PERCENTAGE (%)
5. ✅ **Cancelamento pós-pagamento**: SIM - permite cancelar order mesmo com payment COMPLETED
6. ✅ **Agendamentos simultâneos**: SIM - permite múltiplos agendamentos no mesmo horário

---

## Status esperados para cada entidade

```
Schedule:  SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
Order:     PENDING, IN_PROGRESS, COMPLETED, CANCELLED
Payment:   PENDING, COMPLETED, FAILED, CANCELLED
LoyaltyTx: EARN, REDEEM (não é status, é tipo)
```
