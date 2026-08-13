CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER,
    "name" VARCHAR(50) UNIQUE NOT NULL,
    cost_price NUMERIC(10,2) NOT NULL,
    sale_price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id)
);