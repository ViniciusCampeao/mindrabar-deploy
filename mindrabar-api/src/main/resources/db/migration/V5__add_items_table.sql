CREATE TABLE order_items(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    order_id INTEGER NOT NUll,
    product_id INTEGER NOT NULL,
    quantity INTEGER,
    status VARCHAR(20),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);