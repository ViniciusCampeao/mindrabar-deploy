import { httpClient } from '../httpClient';
import { ITEMS } from '../endpoints';
import type {
  ItemService,
  ItemApiResponse,
  ItemQueueApiResponse,
  CreateItemRequest,
  UpdateItemStatusRequest,
  UpdateItemQuantityRequest
} from './item.interface';
import type { OrderItem } from '../../modules/shared/types/common.types';
import type { MenuItem } from '../../modules/shared/types/common.types';

/**
 * Implementação do serviço de itens
 */
export class ItemServiceImpl implements ItemService {
  /**
   * Mapeia um item da API para o formato da UI
   */
  async mapApiItemToOrderItem(
    item: ItemApiResponse,
    getMenuItemById?: (id: number) => Promise<MenuItem | null>
  ): Promise<OrderItem> {
    let menuItem: MenuItem | undefined;
    
    // Se a função para buscar o MenuItem foi fornecida, tentamos buscar os detalhes do produto
    if (getMenuItemById) {
      try {
        const menuItemData = await getMenuItemById(item.productId);
        if (menuItemData) {
          menuItem = menuItemData;
        }
      } catch (error) {
        console.error(
          `Erro ao buscar detalhes do produto ${item.productId}:`,
          error
        );
      }
    }
    
    return {
      itemId: item.itemId,
      menuItemId: item.productId,
      quantity: item.quantity,
      // Se temos o menuItem, incluímos seus detalhes
      price: menuItem?.price || 0,
      menuItem: menuItem
        ? {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
          }
        : undefined,
    };
  }
  
  /**
   * Busca todos os itens
   */
  async getAllItems(): Promise<ItemApiResponse[]> {
    try {
      const response = await httpClient.get<ItemApiResponse[]>(ITEMS.ALL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os itens:', error);
      return [];
    }
  }
  
  /**
   * Busca um item específico
   */
  async getItemById(itemId: number): Promise<ItemApiResponse | null> {
    try {
      const response = await httpClient.get<ItemApiResponse>(ITEMS.BY_ID(itemId));
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar item ${itemId}:`, error);
      return null;
    }
  }
  
  /**
   * Cria um novo item
   */
  async createItem(data: CreateItemRequest): Promise<ItemApiResponse | null> {
    try {
      const response = await httpClient.post<ItemApiResponse>(ITEMS.ALL, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      return null;
    }
  }
  
  /**
   * Atualiza o status de um item
   */
  async updateItemStatus(
    itemId: number,
    status: string
  ): Promise<ItemApiResponse | null> {
    try {
      const response = await httpClient.patch<ItemApiResponse>(
        ITEMS.UPDATE_STATUS(itemId),
        { status } as UpdateItemStatusRequest
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do item ${itemId}:`, error);
      return null;
    }
  }
  
  /**
   * Atualiza a quantidade de um item
   */
  async updateItemQuantity(
    itemId: number,
    quantity: number
  ): Promise<ItemApiResponse | null> {
    try {
      const response = await httpClient.patch<ItemApiResponse>(
        ITEMS.UPDATE_QUANTITY(itemId),
        { quantity } as UpdateItemQuantityRequest
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar quantidade do item ${itemId}:`, error);
      return null;
    }
  }
  
  /**
   * Deleta um item
   */
  async deleteItem(itemId: number): Promise<boolean> {
    try {
      await httpClient.delete(ITEMS.BY_ID(itemId));
      return true;
    } catch (error) {
      console.error(`Erro ao deletar item ${itemId}:`, error);
      return false;
    }
  }
  
  /**
   * Busca itens por usuário
   */
  async getItemsByUser(userId: number): Promise<ItemApiResponse[]> {
    try {
      const response = await httpClient.get<ItemApiResponse[]>(
        ITEMS.BY_USER(userId)
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do usuário ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca itens por produto
   */
  async getItemsByProduct(productId: number): Promise<ItemApiResponse[]> {
    try {
      const response = await httpClient.get<ItemApiResponse[]>(
        ITEMS.BY_PRODUCT(productId)
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do produto ${productId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca itens por pedido
   */
  async getItemsByOrder(orderId: number): Promise<ItemApiResponse[]> {
    try {
      const response = await httpClient.get<ItemApiResponse[]>(
        ITEMS.BY_ORDER(orderId)
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do pedido ${orderId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca itens de um pedido e converte para OrderItem (para uso na UI)
   */
  async getOrderItemsByOrder(
    orderId: number,
    getMenuItemById?: (id: number) => Promise<MenuItem | null>
  ): Promise<OrderItem[]> {
    try {
      // Buscar itens da API
      const apiItems = await this.getItemsByOrder(orderId);
      
      // Mapear para o formato da UI
      const orderItemsPromises = apiItems.map(item =>
        this.mapApiItemToOrderItem(item, getMenuItemById)
      );
      
      return Promise.all(orderItemsPromises);
    } catch (error) {
      console.error(`Erro ao buscar itens do pedido ${orderId}:`, error);
      return [];
    }
  }
  
  /**
   * Busca itens por status
   */
  async getItemsByStatus(status: string): Promise<ItemQueueApiResponse[]> {
    try {
      const response = await httpClient.get<ItemQueueApiResponse[]>(
        ITEMS.BY_STATUS(status)
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens com status ${status}:`, error);
      return [];
    }
  }
}

// Exporta uma instância para uso em toda a aplicação
export const itemService: ItemService = new ItemServiceImpl();
