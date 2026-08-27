CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT uq_product_categories_company_name UNIQUE (company_id, "name")
);

ALTER TABLE products
ADD COLUMN category_id INTEGER;

ALTER TABLE products
ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id);
