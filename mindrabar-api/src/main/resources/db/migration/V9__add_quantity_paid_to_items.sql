ALTER TABLE order_items
ADD COLUMN quantity_paid INTEGER NOT NULL DEFAULT 0;

ALTER TABLE order_items
ADD CONSTRAINT check_quantity_paid_not_negative CHECK (quantity_paid >= 0);

ALTER TABLE order_items
ADD CONSTRAINT check_quantity_paid_not_exceeds_quantity CHECK (quantity_paid <= quantity);
