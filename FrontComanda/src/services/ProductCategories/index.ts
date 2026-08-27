import api from "../api";
import type { ProductCategory } from "../../types/dashboard";

interface ProductCategoryApiResponse {
  id: number;
  companyId: number;
  name: string;
}

const ProductCategoriesService = {
  // Busca todas as categorias da empresa logada
  getAll: async (): Promise<ProductCategory[]> => {
    try {
      const response = await api.get<ProductCategoryApiResponse[]>("/product-category");

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map(category => ({
        id: category.id,
        companyId: category.companyId,
        name: category.name || "Sem nome",
      }));
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  },

  // Cria uma nova categoria
  create: async (name: string): Promise<ProductCategory> => {
    const response = await api.post<ProductCategoryApiResponse>("/product-category", { name });
    return {
      id: response.data.id,
      companyId: response.data.companyId,
      name: response.data.name,
    };
  },

  // Atualiza o nome de uma categoria
  update: async (id: number, name: string): Promise<ProductCategory> => {
    const response = await api.put<ProductCategoryApiResponse>(`/product-category/${id}`, { name });
    return {
      id: response.data.id,
      companyId: response.data.companyId,
      name: response.data.name,
    };
  },

  // Remove uma categoria
  remove: async (id: number): Promise<void> => {
    await api.delete(`/product-category/${id}`);
  },
};

export default ProductCategoriesService;
