import type { MenuItem } from '../../types/dashboard';

/**
 * Resposta da API para produtos
 */
export interface ProductApiResponse {
  id: number;
  companyId: number;
  name: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Dados para criar um novo produto
 */
export interface CreateProductRequest {
  companyId: number;
  name: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
}

/**
 * Dados para atualizar o estoque de um produto
 */
export interface UpdateStockRequest {
  productId: number;
  stockQuantity: number;
}

/**
 * Dados para atualizar o preço de um produto
 */
export interface UpdatePriceRequest {
  productId: number;
  price: number;
}

/**
 * Porta de serviço de produtos
 */
export interface ProductService {
  /**
   * Busca todos os produtos
   */
  getAllMenuItems(): Promise<MenuItem[]>;
  
  /**
   * Busca um produto específico
   */
  getMenuItemById(id: number): Promise<MenuItem | null>;
  
  /**
   * Cria um novo produto
   */
  createMenuItem(data: CreateProductRequest): Promise<MenuItem | null>;
  
  /**
   * Atualiza o estoque de um produto
   */
  updateMenuItemStock(id: number, quantity: number): Promise<MenuItem | null>;
  
  /**
   * Atualiza o preço de um produto
   */
  updateMenuItemPrice(id: number, price: number): Promise<MenuItem | null>;
  
  /**
   * Deleta um produto
   */
  deleteMenuItem(id: number): Promise<boolean>;
}
