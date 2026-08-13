CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    "name" VARCHAR(50) UNIQUE,
    "description" TEXT,
    product_type VARCHAR(20),
    subscription_plan VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id)
)