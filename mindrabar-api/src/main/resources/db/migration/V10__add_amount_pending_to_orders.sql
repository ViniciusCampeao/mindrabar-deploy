ALTER TABLE orders 
ADD COLUMN amount_pending DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Inicializa amount_pending com o valor atual de total_amount para pedidos existentes (usa COALESCE para tratar NULLs)
UPDATE orders 
SET amount_pending = COALESCE(total_amount, 0.00);
