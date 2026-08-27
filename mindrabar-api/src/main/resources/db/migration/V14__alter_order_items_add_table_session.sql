ALTER TABLE order_items
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE order_items
ADD COLUMN table_session_id INTEGER;

ALTER TABLE order_items
ADD CONSTRAINT fk_order_items_table_session FOREIGN KEY (table_session_id) REFERENCES table_sessions(id);

ALTER TABLE order_items
ADD CONSTRAINT check_order_items_owner CHECK (
    (user_id IS NOT NULL AND table_session_id IS NULL) OR
    (user_id IS NULL AND table_session_id IS NOT NULL)
);
