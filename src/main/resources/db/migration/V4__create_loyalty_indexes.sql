-- Índices para as tabelas de loyalty

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_loyalty_points_id ON loyalty_transactions(loyalty_points_id);
