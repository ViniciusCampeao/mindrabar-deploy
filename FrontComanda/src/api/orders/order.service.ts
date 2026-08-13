import { httpClient } from '../httpClient';
import { ORDERS } from '../endpoints';
import currency from 'currency.js';
import type {
  OrderService,
  OrderApiResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  PaymentRequest,
  PaymentResponse
} from './order.interface';
import type { Order, OrderItem } from '../../modules/shared/types/common.types';
import type { OrderSaleApiResponse, DailySalesReport } from './order-sale.interface';
import { itemService } from '../items';
import { productService } from '../products';

/**
 * Implementação do serviço de pedidos
 */
export class OrderServiceImpl implements OrderService {
  /**
   * Calcula o total de um pedido usando currency.js para precisão monetária
   */
  calculateOrderTotal(order: OrderApiResponse | Order): number {
    if (!order.items || order.items.length === 0) return 0;
    
    const total = order.items.reduce((sum, item: OrderItem) => {
      const price = item.price || (item.menuItem ? item.menuItem.price : 0);
      const itemTotal = currency(price).multiply(item.quantity);
      return sum.add(itemTotal);
    }, currency(0));
    
    return total.value;
  }  /**
   * Busca todos os pedidos
   */
  async getAllOrders(): Promise<Order[]> {
    const response = await httpClient.get<OrderApiResponse[]>(ORDERS.ALL);
    
    return response.data.map(order => ({
      id: order.id,
      tableId: order.tableId,
      status: order.status.toLowerCase() as "open" | "closed",
      items: order.items || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      total: this.calculateOrderTotal(order),
    }));
  }
  
  /**
   * Busca pedidos por status
   */
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const response = await httpClient.get<OrderApiResponse[]>(
        ORDERS.BY_STATUS(status)
      );
      
      // Buscar itens para cada pedido
      const ordersWithItemsPromises = response.data.map(async order => {
        try {
          const items = await itemService.getOrderItemsByOrder(
            order.id,
            async (productId: number) => {
              try {
                const menuItem = await productService.getMenuItemById(productId);
                return menuItem;
              } catch (err) {
                console.error(`Erro ao buscar detalhes do produto ${productId}:`, err);
                return null;
              }
            }
          );
          
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: this.calculateOrderTotal({ ...order, items }),
          };
        } catch (err) {
          console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: 0,
          };
        }
      });
      
      return Promise.all(ordersWithItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar pedidos com status ${status}:`, error);
      return [];
    }
  }
  
  /**
   * Busca pedidos por mesa
   */
  async getOrdersByTable(tableId: number): Promise<Order[]> {
    try {
      const response = await httpClient.get<OrderApiResponse[]>(
        ORDERS.BY_TABLE(tableId)
      );
      
      // Buscar itens para cada pedido
      const ordersWithItemsPromises = response.data.map(async order => {
        try {
          const items = await itemService.getOrderItemsByOrder(
            order.id,
            async (productId: number) => {
              try {
                const menuItem = await productService.getMenuItemById(productId);
                return menuItem;
              } catch (err) {
                console.error(`Erro ao buscar detalhes do produto ${productId}:`, err);
                return null;
              }
            }
          );
          
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: this.calculateOrderTotal({ ...order, items }),
          };
        } catch (err) {
          console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: 0,
          };
        }
      });
      
      return Promise.all(ordersWithItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar pedidos da mesa ${tableId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca um pedido específico
   */
  async getOrderById(id: number): Promise<Order | null> {
    try {
      const response = await httpClient.get<OrderApiResponse>(ORDERS.BY_ID(id));
      
      // Buscar itens do pedido
      try {
        const items = await itemService.getOrderItemsByOrder(
          id,
          async (productId: number) => {
            try {
              const menuItem = await productService.getMenuItemById(productId);
              return menuItem;
            } catch (err) {
              console.error(`Erro ao buscar detalhes do produto ${productId}:`, err);
              return null;
            }
          }
        );
        
        return {
          id: response.data.id,
          tableId: response.data.tableId,
          status: response.data.status.toLowerCase() as "open" | "closed",
          items,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          total: this.calculateOrderTotal({ ...response.data, items }),
        };
      } catch (err) {
        console.error(`Erro ao buscar itens do pedido ${id}:`, err);
        return {
          id: response.data.id,
          tableId: response.data.tableId,
          status: response.data.status.toLowerCase() as "open" | "closed",
          items: [],
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          total: 0,
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar pedido ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Cria um novo pedido
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await httpClient.post<OrderApiResponse>(ORDERS.ALL, data);
      
      return {
        id: response.data.id,
        tableId: response.data.tableId,
        status: response.data.status.toLowerCase() as "open" | "closed",
        items: [],
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        total: 0,
      };
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza o status de um pedido
   */
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const payload: UpdateOrderStatusRequest = {
      id,
      status,
    };
    
    const response = await httpClient.patch<OrderApiResponse>(
      ORDERS.UPDATE_STATUS(id),
      payload
    );
    
    return {
      id: response.data.id,
      tableId: response.data.tableId,
      status: response.data.status.toLowerCase() as "open" | "closed",
      items: response.data.items || [],
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      total: this.calculateOrderTotal(response.data),
    };
  }
  
  /**
   * Deleta um pedido
   */
  async deleteOrder(id: number): Promise<void> {
    await httpClient.delete(ORDERS.BY_ID(id));
  }

  /**
   * Registra o pagamento de um pedido
   */
  async registerPayment(orderId: number, paymentData: PaymentRequest): Promise<PaymentResponse> {
    const response = await httpClient.post<PaymentResponse>(
      ORDERS.PAYMENT(orderId),
      paymentData
    );
    return response.data;
  }

  /**
   * Busca pedidos por dia
   */
  async getOrdersByDay(day: string): Promise<Order[]> {
    try {
      const response = await httpClient.get<OrderApiResponse[]>(
        ORDERS.SALES_BY_DAY(day)
      );
      
      // Buscar itens para cada pedido
      const ordersWithItemsPromises = response.data.map(async order => {
        try {
          const items = await itemService.getOrderItemsByOrder(
            order.id,
            async (productId: number) => {
              try {
                const menuItem = await productService.getMenuItemById(productId);
                return menuItem;
              } catch (err) {
                console.error(`Erro ao buscar detalhes do produto ${productId}:`, err);
                return null;
              }
            }
          );
          
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: this.calculateOrderTotal({ ...order, items }),
          };
        } catch (err) {
          console.error(`Erro ao buscar itens do pedido ${order.id}:`, err);
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: 0,
          };
        }
      });
      
      return Promise.all(ordersWithItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar pedidos do dia ${day}:`, error);
      return [];
    }
  }

  /**
   * Obtém relatório de vendas por dia
   */
  async getOrderSalesByDay(day: string): Promise<DailySalesReport> {
    try {
      const response = await httpClient.get<OrderSaleApiResponse[]>(
        ORDERS.SALES_BY_DAY(day)
      );
      
      // Mapear os dados da API para o formato de frontend
      const orders = response.data.map(order => ({
        orderId: order.orderId,
        items: order.items,
        totalOrderValue: order.totalOrderValue,
        createdAt: order.createdAt
      }));
      
      // Calcular o valor total de vendas
      const totalSales = orders.reduce((sum, order) => sum + order.totalOrderValue, 0);
      
      // Construir o relatório diário
      const report: DailySalesReport = {
        date: day,
        orders,
        totalSales
      };
      
      return report;
    } catch (error) {
      console.error(`Erro ao buscar vendas do dia ${day}:`, error);
      // Retornar um relatório vazio em caso de erro
      return {
        date: day,
        orders: [],
        totalSales: 0
      };
    }
  }
}

// Exporta uma instância para uso em toda a aplicação
export const orderService: OrderService = new OrderServiceImpl();
