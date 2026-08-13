import api from "../api";
import axios from "axios";
import type { Order, OrderItem } from "../../modules/shared/types/common.types";
import ItemsService from "../Items";
import MenuItemsService from "../MenuItems";

// Tipos específicos para os endpoints de ordens
interface OrderApiResponse {
  id: number;
  tableId: number;
  status: string;
  totalAmount: number | null; // Valor total do pedido retornado pelo backend
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

interface CreateOrderRequest {
  items: { menuItemId: number; quantity: number }[];
  tableId: number;
  status?: string;
}

interface UpdateOrderStatusRequest {
  id: number;
  status: string;
}

// Função para calcular o total de itens em um pedido
const calculateOrderTotal = (order: OrderApiResponse | Order): number => {
  if (!order.items || order.items.length === 0) return 0;

  return order.items.reduce((sum, item) => {
    // Verificar onde está o preço (diretamente no item ou em menuItem)
    const price = item.price || item.menuItem?.price || 0;
    return sum + price * item.quantity;
  }, 0);
};

// Serviço para gerenciar ordens/pedidos
const OrdersService = {
  // Método auxiliar para calcular o total de um pedido
  calculateOrderTotal,
  // Busca todas as ordens
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get<OrderApiResponse[]>("/order");

    return response.data.map(order => ({
      id: order.id,
      tableId: order.tableId,
      status: order.status.toLowerCase() as "open" | "closed",
      items: order.items || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Usar totalAmount do backend
      total: order.totalAmount || 0,
    }));
  },

  // Busca ordens por status com seus itens
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    try {
      const response = await api.get<OrderApiResponse[]>(
        `/order/status/${status}`
      );

      // Buscar itens para cada pedido
      const ordersWithItemsPromises = response.data.map(async order => {
        try {
          const items = await ItemsService.getOrderItemsByOrder(
            order.id,
            async (productId: number) => {
              try {
                const menuItem =
                  await MenuItemsService.getMenuItemById(productId);
                return menuItem;
              } catch (err) {
                console.error(`Erro ao buscar menu item ${productId}:`, err);
                return null;
              }
            }
          );

          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: items || [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total:
              items && items.length > 0
                ? items.reduce(
                    (sum: number, item: OrderItem) =>
                      sum +
                      (item.price || item.menuItem?.price || 0) * item.quantity,
                    0
                  )
                : 0,
          };
        } catch (error) {
          console.error(
            `Erro ao carregar itens para o pedido ${order.id}:`,
            error
          );
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

      return await Promise.all(ordersWithItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar pedidos com status ${status}:`, error);
      return [];
    }
  },

  // Busca ordens por mesa com seus itens detalhados (apenas com status OPEN)
  getOrdersByTable: async (
    tableId: number
  ): Promise<Order[]> => {
    try {
      const response = await api.get<OrderApiResponse[]>(
        `/order/table/${tableId}`
      );

      // Sempre filtrar apenas pedidos com status OPEN
      const filteredOrders = response.data.filter(
        order => order.status.toUpperCase() === "OPEN"
      );

      // Buscar itens para cada pedido
      const ordersWithItemsPromises = filteredOrders.map(async order => {
        try {
          const items = await ItemsService.getOrderItemsByOrder(
            order.id,
            async (productId: number) => {
              try {
                const menuItem =
                  await MenuItemsService.getMenuItemById(productId);
                return menuItem;
              } catch (err) {
                console.error(`Erro ao buscar menu item ${productId}:`, err);
                return null;
              }
            }
          );

          // Calcular total: usar totalAmount do backend se disponível, senão calcular
          const total = order.totalAmount 
            ? order.totalAmount 
            : (items && items.length > 0
                ? items.reduce(
                    (sum: number, item: OrderItem) =>
                      sum + (item.price || item.menuItem?.price || 0) * item.quantity,
                    0
                  )
                : 0);

          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: items || [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total,
          };
        } catch (error) {
          console.error(
            `Erro ao carregar itens para o pedido ${order.id}:`,
            error
          );
          return {
            id: order.id,
            tableId: order.tableId,
            status: order.status.toLowerCase() as "open" | "closed",
            items: [],
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            total: order.totalAmount || 0,
          };
        }
      });

      return await Promise.all(ordersWithItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar pedidos da mesa ${tableId}:`, error);
      return [];
    }
  },

  // Busca uma ordem específica pelo ID com itens detalhados
  getOrderById: async (orderId: number): Promise<Order> => {
    try {
      const response = await api.get<OrderApiResponse>(`/order/${orderId}`);

      // Buscar itens detalhados para o pedido
      try {
        const items = await ItemsService.getOrderItemsByOrder(
          orderId,
          async (productId: number) => {
            try {
              const menuItem =
                await MenuItemsService.getMenuItemById(productId);
              return menuItem;
            } catch (err) {
              console.error(`Erro ao buscar menu item ${productId}:`, err);
              return null;
            }
          }
        );

        return {
          id: response.data.id,
          tableId: response.data.tableId,
          status: response.data.status.toLowerCase() as "open" | "closed",
          items: items || [],
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          // Usar totalAmount do backend em vez de calcular manualmente
          total: response.data.totalAmount || 0,
        };
      } catch (error) {
        console.error(
          `Erro ao buscar itens detalhados para o pedido ${orderId}:`,
          error
        );

        // Se falhar em buscar os itens, retorna o pedido com os itens vazios
        return {
          id: response.data.id,
          tableId: response.data.tableId,
          status: response.data.status.toLowerCase() as "open" | "closed",
          items: [],
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          // Usar totalAmount do backend mesmo em caso de erro
          total: response.data.totalAmount || 0,
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar pedido ${orderId}:`, error);
      throw error;
    }
  },

  // Cria uma nova ordem
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      // Verificar se o token está presente
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token de autenticação não encontrado");
        throw new Error("Você precisa estar autenticado para criar um pedido");
      }

      // Mostrar o token no console para depuração (remova em produção)

      // Tentar criar o pedido
      const response = await api.post<OrderApiResponse>("/order", data);

      return {
        id: response.data.id,
        tableId: response.data.tableId,
        status: response.data.status.toLowerCase() as "open" | "closed",
        items: data.items || [],
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        total: 0, // Não há itens para calcular ainda
      };
    } catch (error) {
      console.error("Falha ao criar ordem:", error);

      // Verificar se o erro tem uma resposta para exibir informações mais detalhadas
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        console.error(`Código de erro: ${status}`, data);

        if (status === 403) {
          // Se for um erro de permissão, verificar o papel do usuário atual

          throw new Error(
            `Falha ao criar pedido. Você não tem permissão para esta ação. ` +
              `Apenas gerentes e garçons podem criar pedidos.`
          );
        }

        throw new Error(
          `Falha ao criar pedido. Código de erro: ${status}. ` +
            `Verifique suas permissões ou se a mesa está disponível.`
        );
      }

      throw new Error(
        "Não foi possível criar o pedido. Verifique sua conexão de rede."
      );
    }
  },

  // Atualiza o status de uma ordem
  updateOrderStatus: async (
    orderId: number,
    status: string
  ): Promise<Order> => {
    const payload: UpdateOrderStatusRequest = {
      id: orderId,
      status: status.toUpperCase(),
    };

    const response = await api.patch<OrderApiResponse>(
      `/order/${orderId}/status`,
      payload
    );

    // Recuperar dados completos para calcular o total
    const fullOrder = await OrdersService.getOrderById(orderId);

    return {
      id: response.data.id,
      tableId: response.data.tableId,
      status: response.data.status.toLowerCase() as "open" | "closed",
      items: fullOrder.items, // Usar itens da ordem completa recuperada
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      total: fullOrder.total, // Usar o total calculado
    };
  },

  // Finaliza uma ordem (método de conveniência para fechar pedido)
  closeOrder: async (orderId: number): Promise<Order> => {
    return OrdersService.updateOrderStatus(orderId, "CLOSED");
  },

  // Registra um pagamento (total ou parcial) para um pedido
  registerPayment: async (
    orderId: number,
    paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX',
    amount: number
  ): Promise<void> => {
    await api.post(`/order/${orderId}/payment`, {
      id: orderId,
      paymentMethod,
      amount
    });
  },

  // Deleta uma ordem
  deleteOrder: async (orderId: number): Promise<void> => {
    await api.delete(`/order/${orderId}`);
  },
};

export default OrdersService;
