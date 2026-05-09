-- Índices para performance das tabelas de domínio

CREATE UNIQUE INDEX idx_customer_cpf ON customers(cpf);
CREATE INDEX idx_vehicle_customer_id ON vehicles(customer_id);
CREATE UNIQUE INDEX idx_vehicle_plate ON vehicles(plate);
CREATE UNIQUE INDEX idx_service_name ON services(name);
CREATE INDEX idx_schedule_customer_id ON schedules(customer_id);
CREATE INDEX idx_schedule_vehicle_id ON schedules(vehicle_id);
CREATE INDEX idx_schedule_scheduled_at ON schedules(scheduled_at);
CREATE INDEX idx_schedule_status ON schedules(status);
CREATE INDEX idx_order_customer_id ON orders(customer_id);
CREATE INDEX idx_order_vehicle_id ON orders(vehicle_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_created_at ON orders(created_at);
CREATE INDEX idx_order_item_order_id ON order_items(order_id);
CREATE INDEX idx_payment_order_id ON payments(order_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_product_movement_product_id ON product_movements(product_id);
