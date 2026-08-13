import api from "../api";
import type { MenuItem } from "../../types/dashboard";

// Tipos específicos para os endpoints de produtos
interface ProductApiResponse {
  id: number;
  companyId: number;
  name: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateProductRequest {
  companyId: number;
  name: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
}

interface UpdateStockRequest {
  productId: number;
  stockQuantity: number;
}

interface UpdatePriceRequest {
  productId: number;
  price: number;
}

// Constante para o companyId fixo
const COMPANY_ID = 1;

// Serviço para gerenciar produtos (itens do menu)
const MenuItemsService = {
  // Busca todos os produtos
  getAllMenuItems: async (): Promise<MenuItem[]> => {
    try {
      const response = await api.get<ProductApiResponse[]>(
        `/product/company?companyId=${COMPANY_ID}`
      );

      // Se a resposta for vazia ou não for um array, retornamos um array vazio
      if (!response.data || !Array.isArray(response.data)) {
        console.error("Resposta da API não é um array");
        return [];
      }

      const items = response.data.map(product => {
        // Verificação detalhada dos valores
        let salePrice = 0;
        if (product.salePrice !== undefined && product.salePrice !== null) {
          salePrice = Number(product.salePrice);
          if (isNaN(salePrice)) salePrice = 0;
        }

        let costPrice = 0;
        if (product.costPrice !== undefined && product.costPrice !== null) {
          costPrice = Number(product.costPrice);
          if (isNaN(costPrice)) costPrice = 0;
        }

        let stockQuantity = 0;
        if (
          product.stockQuantity !== undefined &&
          product.stockQuantity !== null
        ) {
          stockQuantity = Number(product.stockQuantity);
          if (isNaN(stockQuantity)) stockQuantity = 0;
        }

        return {
          id: product.id,
          name: product.name || "Sem nome",
          price: salePrice,
          costPrice: costPrice,
          stockQuantity: stockQuantity,
        };
      });

      return items;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  // Busca um produto pelo ID
  getMenuItemById: async (itemId: number): Promise<MenuItem> => {
    const response = await api.get<ProductApiResponse>(`/product/${itemId}`);

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Busca produto por nome
  getMenuItemsByName: async (name: string): Promise<MenuItem[]> => {
    const response = await api.get<ProductApiResponse[]>(
      `/product/name/${name}`
    );

    return response.data.map(product => {
      const salePrice = Number(product.salePrice) || 0;
      const costPrice = Number(product.costPrice) || 0;
      const stockQuantity = Number(product.stockQuantity) || 0;

      return {
        id: product.id,
        name: product.name || "Sem nome",
        price: salePrice,
        costPrice: costPrice,
        stockQuantity: stockQuantity,
      };
    });
  },

  // Cria um novo produto
  createMenuItem: async (data: {
    name: string;
    costPrice: number;
    salePrice: number;
    stockQuantity: number;
  }): Promise<MenuItem> => {
    // Usando o COMPANY_ID fixo
    const payload: CreateProductRequest = {
      companyId: COMPANY_ID,
      name: data.name,
      costPrice: data.costPrice,
      salePrice: data.salePrice,
      stockQuantity: data.stockQuantity,
    };

    const response = await api.post<ProductApiResponse>(`/product`, payload);

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Atualiza o preço de venda de um produto
  updateMenuItemPrice: async (id: number, price: number): Promise<MenuItem> => {
    const payload: UpdatePriceRequest = {
      productId: id,
      price: price,
    };

    const response = await api.patch<ProductApiResponse>(
      `/product/${id}/price/sale`,
      payload
    );

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Atualiza o preço de custo de um produto
  updateMenuItemCostPrice: async (
    id: number,
    price: number
  ): Promise<MenuItem> => {
    const payload: UpdatePriceRequest = {
      productId: id,
      price: price,
    };

    const response = await api.patch<ProductApiResponse>(
      `/product/${id}/price/cost`,
      payload
    );

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Adiciona estoque a um produto
  addMenuItemStock: async (id: number, quantity: number): Promise<MenuItem> => {
    const payload: UpdateStockRequest = {
      productId: id,
      stockQuantity: quantity,
    };

    const response = await api.patch<ProductApiResponse>(
      `/product/${id}/stock/add`,
      payload
    );

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Remove estoque de um produto
  removeMenuItemStock: async (
    id: number,
    quantity: number
  ): Promise<MenuItem> => {
    const payload: UpdateStockRequest = {
      productId: id,
      stockQuantity: quantity,
    };

    const response = await api.patch<ProductApiResponse>(
      `/product/${id}/stock/remove`,
      payload
    );

    const salePrice = Number(response.data.salePrice) || 0;
    const costPrice = Number(response.data.costPrice) || 0;
    const stockQuantity = Number(response.data.stockQuantity) || 0;

    return {
      id: response.data.id,
      name: response.data.name || "Sem nome",
      price: salePrice,
      costPrice: costPrice,
      stockQuantity: stockQuantity,
    };
  },

  // Exclui um produto
  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/product/${id}`);
  },
};

export default MenuItemsService;
