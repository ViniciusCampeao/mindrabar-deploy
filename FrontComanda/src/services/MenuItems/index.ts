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
  categoryId?: number | null;
  categoryName?: string | null;
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

interface UpdateCategoryRequest {
  categoryId: number | null;
}

// Constante para o companyId fixo
const COMPANY_ID = 1;

// Converte a resposta bruta da API para o formato usado na UI
function toMenuItem(product: ProductApiResponse): MenuItem {
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
  if (product.stockQuantity !== undefined && product.stockQuantity !== null) {
    stockQuantity = Number(product.stockQuantity);
    if (isNaN(stockQuantity)) stockQuantity = 0;
  }

  return {
    id: product.id,
    name: product.name || "Sem nome",
    price: salePrice,
    costPrice: costPrice,
    stockQuantity: stockQuantity,
    categoryId: product.categoryId ?? null,
    categoryName: product.categoryName ?? null,
  };
}

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

      return response.data.map(toMenuItem);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  // Busca um produto pelo ID
  getMenuItemById: async (itemId: number): Promise<MenuItem> => {
    const response = await api.get<ProductApiResponse>(`/product/${itemId}`);
    return toMenuItem(response.data);
  },

  // Busca produto por nome
  getMenuItemsByName: async (name: string): Promise<MenuItem[]> => {
    const response = await api.get<ProductApiResponse[]>(
      `/product/name/${name}`
    );

    return response.data.map(toMenuItem);
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
    return toMenuItem(response.data);
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
    return toMenuItem(response.data);
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
    return toMenuItem(response.data);
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
    return toMenuItem(response.data);
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
    return toMenuItem(response.data);
  },

  // Atribui (ou remove, com categoryId null) a categoria de um produto
  assignCategory: async (id: number, categoryId: number | null): Promise<MenuItem> => {
    const payload: UpdateCategoryRequest = { categoryId };
    const response = await api.patch<ProductApiResponse>(
      `/product/${id}/category`,
      payload
    );
    return toMenuItem(response.data);
  },

  // Exclui um produto
  deleteMenuItem: async (id: number): Promise<void> => {
    await api.delete(`/product/${id}`);
  },
};

export default MenuItemsService;
