/**
 * Interface que representa o item de um pedido de venda
 */
export interface OrderItemSaleDTO {
  productId: number;
  productName: string;
  productPrice: number; // Convertido de BigDecimal para number
  quantity: number;
  itemTotalValue: number; // Convertido de BigDecimal para number
}

/**
 * Interface que representa a resposta da API para vendas de pedidos
 */
export interface OrderSaleApiResponse {
  orderId: number;
  items: OrderItemSaleDTO[];
  totalOrderValue: number; // Convertido de BigDecimal para number
  createdAt: string; // Convertido de LocalDateTime para string ISO
}

/**
 * Interface para representar os dados de venda de pedidos no frontend
 */
export interface OrderSale {
  orderId: number;
  items: OrderItemSaleDTO[];
  totalOrderValue: number;
  createdAt: string;
}

/**
 * Interface para relatório de vendas por dia
 */
export interface DailySalesReport {
  date: string;
  orders: OrderSale[];
  totalSales: number;
}
