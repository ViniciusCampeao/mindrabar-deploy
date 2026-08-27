CREATE TABLE table_sessions (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    session_token VARCHAR(64) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    confirmed_by INTEGER,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (customer_id) REFERENCES qr_customers(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id),
    CONSTRAINT uq_table_sessions_session_token UNIQUE (session_token)
);
