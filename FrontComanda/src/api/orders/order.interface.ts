import type { Order, OrderItem } from '../../modules/shared/types/common.types';
import type { DailySalesReport } from './order-sale.interface';

/**
 * Resposta da API para pedidos
 */
export interface OrderApiResponse {
  id: number;
  tableId: number;
  status: string;
  totalAmount: number | null; // Valor total do pedido retornado pelo backend
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

/**
 * Dados para criar um pedido
 */
export interface CreateOrderRequest {
  items: { menuItemId: number; quantity: number }[];
  tableId: number;
  status?: string;
}

/**
 * Dados para atualizar status de um pedido
 */
export interface UpdateOrderStatusRequest {
  id: number;
  status: string;
}

/**
 * Tipos de métodos de pagamento
 */
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX';

/**
 * Dados para registrar pagamento de um pedido
 */
export interface PaymentRequest {
  id: number;
  paymentMethod: PaymentMethod;
  amount: number;
}

/**
 * Resposta do pagamento
 */
export interface PaymentResponse {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  createdAt: string;
}

/**
 * Porta de serviço de pedidos
 */
export interface OrderService {
  /**
   * Calcula o total de um pedido
   */
  calculateOrderTotal(order: OrderApiResponse | Order): number;
  
  /**
   * Busca todos os pedidos
   */
  getAllOrders(): Promise<Order[]>;
  
  /**
   * Busca pedidos por status
   */
  getOrdersByStatus(status: string): Promise<Order[]>;
  
  /**
   * Busca pedidos por mesa
   */
  getOrdersByTable(tableId: number): Promise<Order[]>;
  
  /**
   * Busca pedidos por dia
   */
  getOrdersByDay(day: string): Promise<Order[]>;
  
  /**
   * Busca um pedido específico
   */
  getOrderById(id: number): Promise<Order | null>;
  
  /**
   * Cria um novo pedido
   */
  createOrder(data: CreateOrderRequest): Promise<Order>;
  
  /**
   * Atualiza o status de um pedido
   */
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  /**
   * Deleta um pedido
   */
  deleteOrder(id: number): Promise<void>;

  /**
   * Registra o pagamento de um pedido
   */
  registerPayment(orderId: number, paymentData: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Obtém relatório de vendas por dia
   */
  getOrderSalesByDay(day: string): Promise<DailySalesReport>;
}
