import api from "../api";
import type {
  Table,
  Order,
  OrderItem,
  TableStatus,
} from "../../modules/shared/types/common.types";
import OrdersService from "../Orders";

// Tipos específicos para os endpoints de mesas\

interface TableApiResponse {
  id: number;
  name: string;
  status: TableStatus;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateTableRequest {
  name: string;
  status: string;
}

interface UpdateTableStatusRequest {
  id: number;
  status: string;
}

interface UpdateTableNameRequest {
  id: number;
  name: string;
}

// Serviço para gerenciar mesas
const TablesService = {
  // Busca todas as mesas com informações detalhadas dos pedidos
  getTablesWithOrderDetails: async (): Promise<Table[]> => {
    try {
      // Buscar todas as mesas
      const tables = await TablesService.getAllTables();

      // Buscar pedidos para cada mesa individualmente
      const tablesWithOrdersPromises = tables.map(async (table: Table) => {
        try {
          // Buscar APENAS pedidos ABERTOS desta mesa com itens detalhados
          const tableOrders = await OrdersService.getOrdersByTable(
            table.id
          );

          // Calcular totais
          let totalItems = 0;
          let totalValue = 0;

          // Verificar se há pedidos
          if (tableOrders && tableOrders.length > 0) {
            tableOrders.forEach((order: Order) => {
              // Verificar se o pedido tem itens e se não é null/undefined
              if (
                order &&
                order.items &&
                Array.isArray(order.items) &&
                order.items.length > 0
              ) {
                // Calcular total de itens considerando a quantidade de cada um
                const itemsCount = order.items.reduce(
                  (sum: number, item: OrderItem) => {
                    // Verificar se o item tem quantidade definida
                    const quantity =
                      item && typeof item.quantity === "number"
                        ? item.quantity
                        : 0;
                    return sum + quantity;
                  },
                  0
                );

                totalItems += itemsCount;
              }

              // Somar o totalValue retornado pelo backend para cada pedido
              const orderTotal =
                typeof order.total === "number" ? order.total : 0;
              totalValue += orderTotal;
            });
          }

          // Retornar mesa com informações adicionais
          const tableWithOrders = {
            ...table,
            orders: tableOrders || [],
            totalItems,
            totalValue,
          } as Table;

          return tableWithOrders;
        } catch (error) {
          console.error(
            `Erro ao processar pedidos da mesa ${table.id}:`,
            error
          );
          return table;
        }
      });

      return await Promise.all(tablesWithOrdersPromises);
    } catch (error) {
      console.error("Erro ao buscar mesas com detalhes de pedidos:", error);
      return [];
    }
  },

  // Busca todas as mesas
  getAllTables: async (): Promise<Table[]> => {
    const response = await api.get<TableApiResponse[]>("/tables");
    return response.data.map(table => ({
      id: table.id,
      number: table.id, // Usando id como número por enquanto
      name: table.name,
      status: table.status === "AVAILABLE" ? "AVAILABLE" : "OCCUPIED",
      totalItems: 0, // Precisará ser preenchido separadamente
      totalValue: 0, // Precisará ser preenchido separadamente
      totalAmount: 0, // Precisará ser preenchido separadamente
    }));
  },

  // Cria uma nova mesa
  createTable: async (data: { name: string }): Promise<Table> => {
    const payload: CreateTableRequest = {
      name: data.name,
      status: "AVAILABLE", // Status padrão ao criar
    };

    const response = await api.post<TableApiResponse>("/tables", payload);

    // Extrair número da mesa a partir do nome (ex: "Mesa 1" -> 1)
    let tableNumber = 1;  // Valor padrão
    if (response.data.name) {
      const match = response.data.name.match(/\d+/);
      if (match) {
        tableNumber = parseInt(match[0], 10);
      }
    }
    
    return {
      id: response.data.id,
      number: tableNumber, // Usa o número extraído do nome
      name: response.data.name,
      status: "AVAILABLE",
      totalItems: 0,
      totalValue: 0,
      totalAmount: 0,
    };
  },

  // Atualiza o status de uma mesa
  updateTableStatus: async (
    id: number,
    status: TableStatus
  ): Promise<Table> => {
    const apiStatus = status === "AVAILABLE" ? "AVAILABLE" : "OCCUPIED";

    const payload: UpdateTableStatusRequest = {
      id: id,
      status: apiStatus,
    };

    const response = await api.patch<TableApiResponse>(
      `/tables/${id}/status`,
      payload
    );

    // Após atualizar o status, buscar detalhes completos da mesa

    // Buscar mesa com detalhes atualizados
    try {
      const updatedTables = await TablesService.getTablesWithOrderDetails();
      const updatedTable = updatedTables.find(table => table.id === id);

      if (updatedTable) {
        return updatedTable;
      }
    } catch (err) {
      console.error(`Erro ao buscar detalhes atualizados da mesa ${id}:`, err);
    }

    // Fallback: retornar objeto básico da resposta da API
    // Extrair número da mesa a partir do nome (ex: "Mesa 1" -> 1)
    let tableNumber = 1;  // Valor padrão
    if (response.data.name) {
      const match = response.data.name.match(/\d+/);
      if (match) {
        tableNumber = parseInt(match[0], 10);
      }
    }
    
    return {
      id: response.data.id,
      number: tableNumber, // Usa o número extraído do nome
      name: response.data.name,
      status: response.data.status === "AVAILABLE" ? "AVAILABLE" : "OCCUPIED",
      totalItems: 0,
      totalValue: 0,
      totalAmount: 0,
    };
  },

  // Atualiza o nome de uma mesa
  updateTableName: async (id: number, name: string): Promise<Table> => {
    const payload: UpdateTableNameRequest = {
      id: id,
      name: name,
    };

    const response = await api.patch<TableApiResponse>(
      `/tables/${id}/name`,
      payload
    );

    // Extrair número da mesa a partir do nome (ex: "Mesa 1" -> 1)
    let tableNumber = 1;  // Valor padrão
    if (response.data.name) {
      const match = response.data.name.match(/\d+/);
      if (match) {
        tableNumber = parseInt(match[0], 10);
      }
    }
    
    return {
      id: response.data.id,
      number: tableNumber, // Usa o número extraído do nome
      name: response.data.name,
      status: response.data.status === "AVAILABLE" ? "AVAILABLE" : "OCCUPIED",
      totalItems: 0,
      totalValue: 0,
      totalAmount: 0,
    };
  },

  // Deleta uma mesa
  deleteTable: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};

export default TablesService;
