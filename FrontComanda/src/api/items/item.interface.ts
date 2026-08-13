import type { OrderItem } from '../../modules/shared/types/common.types';
import type { MenuItem } from '../../modules/shared/types/common.types';

/**
 * Resposta da API para itens
 */
export interface ItemApiResponse {
  itemId: number;
  userId: number;
  orderId: number;
  productId: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Resposta da API para itens na fila (pelo status)
 */
export interface ItemQueueApiResponse {
  itemId?: number;      // ID do item (opcional, pode não estar presente na resposta)
  orderId: number | null;
  tableName: string;
  username: string;
  productName: string;
  quantity: number;
  status: string;
  note?: string;        // Observação do pedido (opcional)
  createdAt: string;
}

/**
 * Dados para criar um novo item
 */
export interface CreateItemRequest {
  userId: number;
  orderId: number;
  productId: number;
  quantity: number;
  status: string;
}

/**
 * Dados para atualizar o status de um item
 */
export interface UpdateItemStatusRequest {
  status: string;
}

/**
 * Dados para atualizar a quantidade de um item
 */
export interface UpdateItemQuantityRequest {
  quantity: number;
}

/**
 * Porta de serviço de itens
 */
export interface ItemService {
  /**
   * Mapeia um item da API para o formato da UI
   */
  mapApiItemToOrderItem(
    item: ItemApiResponse,
    getMenuItemById?: (id: number) => Promise<MenuItem | null>
  ): Promise<OrderItem>;
  
  /**
   * Busca todos os itens
   */
  getAllItems(): Promise<ItemApiResponse[]>;
  
  /**
   * Busca um item específico
   */
  getItemById(itemId: number): Promise<ItemApiResponse | null>;
  
  /**
   * Cria um novo item
   */
  createItem(data: CreateItemRequest): Promise<ItemApiResponse | null>;
  
  /**
   * Atualiza o status de um item
   */
  updateItemStatus(
    itemId: number,
    status: string
  ): Promise<ItemApiResponse | null>;
  
  /**
   * Atualiza a quantidade de um item
   */
  updateItemQuantity(
    itemId: number,
    quantity: number
  ): Promise<ItemApiResponse | null>;
  
  /**
   * Deleta um item
   */
  deleteItem(itemId: number): Promise<boolean>;
  
  /**
   * Busca itens por usuário
   */
  getItemsByUser(userId: number): Promise<ItemApiResponse[]>;
  
  /**
   * Busca itens por produto
   */
  getItemsByProduct(productId: number): Promise<ItemApiResponse[]>;
  
  /**
   * Busca itens por pedido
   */
  getItemsByOrder(orderId: number): Promise<ItemApiResponse[]>;
  
  /**
   * Busca itens de um pedido e converte para OrderItem (para uso na UI)
   */
  getOrderItemsByOrder(
    orderId: number,
    getMenuItemById?: (id: number) => Promise<MenuItem | null>
  ): Promise<OrderItem[]>;
  
  /**
   * Busca itens por status
   */
  getItemsByStatus(status: string): Promise<ItemQueueApiResponse[]>;
}
