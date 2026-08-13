import { httpClient } from '../httpClient';
import { TABLES } from '../endpoints';
import type {
  TableService,
  TableApiResponse,
  CreateTableRequest,
  UpdateTableStatusRequest,
  UpdateTableNameRequest
} from './table.interface';
import type { Table } from '../../modules/shared/types/common.types';
import { orderService } from '../orders';

/**
 * Implementação do serviço de mesas
 */
export class TableServiceImpl implements TableService {
  /**
   * Busca todas as mesas com informações detalhadas dos pedidos
   */
  async getTablesWithOrderDetails(): Promise<Table[]> {
    try {
      // Buscar todas as mesas
      const tables = await this.getAllTables();
      
      // Buscar pedidos para cada mesa individualmente
      const tablesWithOrdersPromises = tables.map(async (table: Table) => {
        try {
          // Buscar APENAS pedidos ABERTOS desta mesa com itens detalhados
          const tableOrders = await orderService.getOrdersByTable(table.id);
          
          // Calcular o total de pedidos abertos nesta mesa
          const total = tableOrders.reduce((sum, order) => {
            return sum + (order.total || 0);
          }, 0);
          
          // Retornar mesa com detalhes dos pedidos
          return {
            ...table,
            orders: tableOrders,
            totalItems: tableOrders.reduce((sum, order) => 
              sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
            totalValue: total,
          };
        } catch (error) {
          console.error(`Erro ao buscar pedidos da mesa ${table.id}:`, error);
          return {
            ...table,
            orders: [],
            totalItems: 0,
            totalValue: 0,
          };
        }
      });
      
      // Aguardar todas as promessas resolverem
      return Promise.all(tablesWithOrdersPromises);
    } catch (error) {
      console.error('Erro ao buscar mesas com detalhes:', error);
      return [];
    }
  }
  
  /**
   * Busca todas as mesas
   */
  async getAllTables(): Promise<Table[]> {
    try {
      const response = await httpClient.get<TableApiResponse[]>(TABLES.ALL);
      
      // Mapear resposta da API para o formato esperado pela UI
      return response.data.map(table => {
        // Extrair número da mesa a partir do nome (ex: "Mesa 1" -> 1)
        let tableNumber = 1;  // Valor padrão
        if (table.name) {
          const match = table.name.match(/\d+/);
          if (match) {
            tableNumber = parseInt(match[0], 10);
          }
        }

        return {
          id: table.id,
          number: tableNumber, // Usa o número extraído do nome
          name: table.name,
          status: table.status,
          orders: [], // Será preenchido posteriormente se necessário
          totalItems: 0, // Será calculado posteriormente se necessário
          totalValue: 0, // Será calculado posteriormente se necessário
        };
      });
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      return [];
    }
  }
  
  /**
   * Busca uma mesa específica
   */
  async getTableById(id: number): Promise<Table | null> {
    try {
      const response = await httpClient.get<TableApiResponse>(TABLES.BY_ID(id));
      
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
        status: response.data.status,
        orders: [],
        totalItems: 0,
        totalValue: 0,
      };
    } catch (error) {
      console.error(`Erro ao buscar mesa ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Cria uma nova mesa
   */
  async createTable(data: CreateTableRequest): Promise<Table> {
    const response = await httpClient.post<TableApiResponse>(TABLES.ALL, data);
    
    return {
      id: response.data.id,
      number: response.data.id,
      name: response.data.name,
      status: response.data.status,
      orders: [],
      totalItems: 0,
      totalValue: 0,
    };
  }
  
  /**
   * Atualiza o status de uma mesa
   */
  async updateTableStatus(id: number, status: string): Promise<Table> {
    const apiStatus = status === "AVAILABLE" ? "AVAILABLE" : "OCCUPIED";
    
    const payload: UpdateTableStatusRequest = {
      id: id,
      status: apiStatus,
    };
    
    const response = await httpClient.patch<TableApiResponse>(
      TABLES.UPDATE_STATUS(id),
      payload
    );
    
    // Após atualizar o status, buscar detalhes completos da mesa
    try {
      const updatedTables = await this.getTablesWithOrderDetails();
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
      orders: [],
      totalItems: 0,
      totalValue: 0,
    };
  }
  
  /**
   * Atualiza o nome de uma mesa
   */
  async updateTableName(id: number, name: string): Promise<Table> {
    const payload: UpdateTableNameRequest = {
      id,
      name,
    };
    
    const response = await httpClient.patch<TableApiResponse>(
      TABLES.UPDATE_NAME(id),
      payload
    );
    
    return {
      id: response.data.id,
      number: response.data.id,
      name: response.data.name,
      status: response.data.status,
      orders: [],
      totalItems: 0,
      totalValue: 0,
    };
  }
  
  /**
   * Deleta uma mesa
   */
  async deleteTable(id: number): Promise<boolean> {
    try {
      await httpClient.delete(TABLES.BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Erro ao deletar mesa ${id}:`, error);
      return false;
    }
  }
}

// Exporta uma instância para uso em toda a aplicação
export const tableService: TableService = new TableServiceImpl();
