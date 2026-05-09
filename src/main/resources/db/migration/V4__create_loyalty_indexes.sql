-- Índices para as tabelas de loyalty

CREATE INDEX idx_loyalty_point_customer_id ON loyalty_points(customer_id);
CREATE INDEX idx_loyalty_transaction_loyalty_point_id ON loyalty_transactions(loyalty_point_id);
