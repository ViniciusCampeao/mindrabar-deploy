import api from "../api";
import axios from "axios";
import type { OrderItem } from "../../modules/shared/types/common.types";
import type { MenuItem } from "../../modules/shared/types/common.types";

// Interface para a resposta da API de itens
interface ItemApiResponse {
  itemId: number;
  userId: number;
  orderId: number;
  productId: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para criar um novo item
interface CreateItemRequest {
  userId: number; // Mudando de opcional para obrigatório conforme a API
  orderId: number;
  productId: number;
  quantity: number;
  status: string; // Mudando de opcional para obrigatório conforme a API
}

// Interface para atualizar o status de um item
interface UpdateItemStatusRequest {
  status: string;
}

// Interface para atualizar a quantidade de um item
interface UpdateItemQuantityRequest {
  quantity: number;
}

// Mapeamento de item da API para OrderItem da UI
const mapApiItemToOrderItem = async (
  item: ItemApiResponse,
  getMenuItemById?: (id: number) => Promise<MenuItem | null>
): Promise<OrderItem> => {
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
    itemId: item.itemId, // Preservar o itemId para operações como exclusão
    menuItemId: item.productId,
    quantity: item.quantity,
    // Se tivermos o menuItem, podemos usar o preço dele
    price: menuItem?.price,
    menuItem: menuItem,
  };
};

// Serviço para gerenciar itens de pedidos
const ItemsService = {
  // Buscar todos os itens
  getAllItems: async (): Promise<ItemApiResponse[]> => {
    try {
      const response = await api.get<ItemApiResponse[]>("/item");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      return [];
    }
  },

  // Criar um novo item
  createItem: async (
    data: CreateItemRequest
  ): Promise<ItemApiResponse | null> => {
    try {
      const response = await api.post<ItemApiResponse>("/item", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar item:", error);
      return null;
    }
  },

  // Atualizar o status de um item
  updateItemStatus: async (
    itemId: number,
    status: string
  ): Promise<ItemApiResponse | null> => {
    try {
      const response = await api.patch<ItemApiResponse>(
        `/item/${itemId}/status`,
        { status } as UpdateItemStatusRequest
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do item ${itemId}:`, error);
      return null;
    }
  },

  // Atualizar a quantidade de um item
  updateItemQuantity: async (
    itemId: number,
    quantity: number
  ): Promise<ItemApiResponse | null> => {
    try {
      const response = await api.patch<ItemApiResponse>(
        `/item/${itemId}/quantity`,
        { quantity } as UpdateItemQuantityRequest
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar quantidade do item ${itemId}:`, error);
      return null;
    }
  },

  // Buscar item por ID
  getItemById: async (itemId: number): Promise<ItemApiResponse | null> => {
    try {
      const response = await api.get<ItemApiResponse>(`/item/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar item ${itemId}:`, error);
      return null;
    }
  },

  // Deletar um item
  deleteItem: async (itemId: number): Promise<boolean> => {
    try {
      // Verificar se o usuário é um gerente
      const userData = localStorage.getItem('userData');
      if (!userData) {
        console.error("Usuário não autenticado");
        return false;
      }
      
      const user = JSON.parse(userData);
      if (user.role !== 'MANAGER') {
        console.error("Permissão negada: Apenas gerentes podem remover itens");
        return false;
      }
      
      await api.delete(`/item/${itemId}`);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar item ${itemId}:`, error);
      return false;
    }
  },

  // Listar itens de um usuário
  getItemsByUser: async (userId: number): Promise<ItemApiResponse[]> => {
    try {
      const response = await api.get<ItemApiResponse[]>(`/item/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do usuário ${userId}:`, error);
      return [];
    }
  },

  // Listar itens de um produto
  getItemsByProduct: async (productId: number): Promise<ItemApiResponse[]> => {
    try {
      const response = await api.get<ItemApiResponse[]>(
        `/item/product/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do produto ${productId}:`, error);
      return [];
    }
  },

  // Listar itens de um pedido
  getItemsByOrder: async (orderId: number): Promise<ItemApiResponse[]> => {
    try {
      const response = await api.get<ItemApiResponse[]>(
        `/item/order/${orderId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar itens do pedido ${orderId}:`, error);
      return [];
    }
  },

  // Listar itens de um pedido e converter para OrderItem (para uso na UI)
  getOrderItemsByOrder: async (
    orderId: number,
    getMenuItemById: (id: number) => Promise<MenuItem | null>
  ): Promise<OrderItem[]> => {
    try {
      // Garantir que orderId é um número
      if (!orderId || isNaN(Number(orderId))) {
        console.error("ID do pedido inválido:", orderId);
        return [];
      }

      try {
        // Requisição para buscar itens do pedido
        const response = await api.get<ItemApiResponse[]>(
          `/item/order/${Number(orderId)}`
        );

        // Verificar se a resposta tem dados
        if (!response.data || response.data.length === 0) {
          return [];
        }

        // Converter cada item da API para OrderItem com as informações do MenuItem
        const orderItemsPromises = response.data.map(async item => {
          try {
            const orderItem = await mapApiItemToOrderItem(
              item,
              getMenuItemById
            );
            return orderItem;
          } catch (error) {
            console.error(
              `Erro ao mapear item ${item.itemId} para OrderItem:`,
              error
            );
            return null;
          }
        });

        // Aguardar todas as promessas e filtrar itens nulos
        const items = await Promise.all(orderItemsPromises);
        const validItems = items.filter(item => item !== null) as OrderItem[];

        return validItems;
      } catch (error) {
        // Tratamento específico para erros de acesso à API de itens
        console.error(`Erro ao buscar itens do pedido ${orderId}:`, error);
        return [];
      }
    } catch (error) {
      console.error(`Erro ao buscar itens do pedido ${orderId}:`, error);
      return [];
    }
  },

  // Adicionar um item a um pedido
  addItemToOrder: async (
    orderId: number,
    productId: number,
    quantity: number,
    userId?: number
  ): Promise<ItemApiResponse | null> => {
    try {
      // Verificar se o token de autenticação está presente
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token de autenticação não encontrado");
        throw new Error("Você precisa estar autenticado para adicionar itens");
      }

      // Se o userId não foi fornecido, tente obtê-lo do localStorage
      if (!userId) {
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            userId = user.userId;
          } catch {
            console.error("Erro ao obter userId do localStorage");
            throw new Error(
              "Não foi possível identificar o usuário. Por favor, faça login novamente."
            );
          }
        } else {
          console.error("Dados do usuário não encontrados no localStorage");
          throw new Error(
            "Você precisa estar autenticado para adicionar itens."
          );
        }
      }

      // Converter para número e verificar se é válido
      userId = Number(userId);

      // Verificar se temos um userId válido
      if (!userId || isNaN(userId)) {
        throw new Error(
          "ID de usuário inválido. Por favor, faça login novamente."
        );
      }

      // Dados do item a ser adicionado
      const itemData: CreateItemRequest = {
        orderId: Number(orderId),
        productId: Number(productId),
        quantity: Number(quantity),
        status: "PENDING", // Usando PENDING conforme a especificação da API
        userId: Number(userId), // Incluir o ID do usuário é importante para autorização
      };

      // Enviar requisição para adicionar o item
      const response = await api.post<ItemApiResponse>("/item", itemData);
      return response.data;
    } catch (error) {
      // Melhorar mensagem de erro
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        throw new Error(
          `Erro ao adicionar item ao pedido. Código: ${status}. ` +
            `Verifique suas permissões ou se o pedido está disponível.`
        );
      }

      // Para outros tipos de erro
      throw new Error(
        `Erro ao adicionar item ao pedido: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  },

  // Remover um item de um pedido (por ID do item)
  removeItemFromOrder: async (itemId: number): Promise<boolean> => {
    return ItemsService.deleteItem(itemId);
  },

  // Atualizar a quantidade de um item em um pedido
  updateOrderItemQuantity: async (
    itemId: number,
    quantity: number
  ): Promise<ItemApiResponse | null> => {
    return ItemsService.updateItemQuantity(itemId, quantity);
  },
};

export default ItemsService;
