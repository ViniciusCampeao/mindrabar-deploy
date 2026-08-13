ALTER TABLE orders
ADD COLUMN payment_method VARCHAR(50);

ALTER TABLE orders
ADD COLUMN total_amount NUMERIC(10, 2);