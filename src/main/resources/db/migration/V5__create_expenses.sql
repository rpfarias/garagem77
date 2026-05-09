-- Módulo de Despesas

-- Categorias de despesa
CREATE TABLE expense_categories (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_expense_category_name ON expense_categories(name);

-- Despesas
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    supplier VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    expense_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    category_id BIGINT NOT NULL REFERENCES expense_categories(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expense_category_id ON expenses(category_id);
CREATE INDEX idx_expense_date ON expenses(expense_date);
CREATE INDEX idx_expense_due_date ON expenses(due_date);
CREATE INDEX idx_expense_status ON expenses(payment_status);
