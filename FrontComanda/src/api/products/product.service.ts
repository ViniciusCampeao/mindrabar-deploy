import { httpClient } from '../httpClient';
import { PRODUCTS } from '../endpoints';
import type {
  ProductService,
  ProductApiResponse,
  CreateProductRequest,
  UpdateStockRequest,
  UpdatePriceRequest
} from './product.interface';
import type { MenuItem } from '../../types/dashboard';

// Constante para o companyId fixo
const COMPANY_ID = 1;

/**
 * Implementação do serviço de produtos
 */
export class ProductServiceImpl implements ProductService {
  /**
   * Busca todos os produtos
   */
  async getAllMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await httpClient.get<ProductApiResponse[]>(
        PRODUCTS.BY_COMPANY(COMPANY_ID)
      );
      
      // Se a resposta for vazia ou não for um array, retornamos um array vazio
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Resposta da API não é um array');
        return [];
      }
      
      const items = response.data.map(product => {
        // Verificação detalhada dos valores
        let salePrice = 0;
        if (typeof product.salePrice === 'number') {
          salePrice = product.salePrice;
        } else if (
          typeof product.salePrice === 'string' &&
          !isNaN(parseFloat(product.salePrice))
        ) {
          salePrice = parseFloat(product.salePrice);
        }
        
        // Verificar o estoque
        let stockQuantity = 0;
        if (typeof product.stockQuantity === 'number') {
          stockQuantity = product.stockQuantity;
        } else if (
          typeof product.stockQuantity === 'string' &&
          !isNaN(parseInt(product.stockQuantity))
        ) {
          stockQuantity = parseInt(product.stockQuantity);
        }
        
        // Criar objeto MenuItem com valores padronizados
        return {
          id: product.id,
          name: product.name,
          price: salePrice,
          costPrice: product.costPrice,
          stockQuantity: stockQuantity,
        };
      });
      
      return items;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }
  
  /**
   * Busca um produto específico
   */
  async getMenuItemById(id: number): Promise<MenuItem | null> {
    try {
      const response = await httpClient.get<ProductApiResponse>(PRODUCTS.BY_ID(id));
      
      // Verificação detalhada dos valores
      let salePrice = 0;
      if (typeof response.data.salePrice === 'number') {
        salePrice = response.data.salePrice;
      } else if (
        typeof response.data.salePrice === 'string' &&
        !isNaN(parseFloat(response.data.salePrice))
      ) {
        salePrice = parseFloat(response.data.salePrice);
      }
      
      // Verificar o estoque
      let stockQuantity = 0;
      if (typeof response.data.stockQuantity === 'number') {
        stockQuantity = response.data.stockQuantity;
      } else if (
        typeof response.data.stockQuantity === 'string' &&
        !isNaN(parseInt(response.data.stockQuantity))
      ) {
        stockQuantity = parseInt(response.data.stockQuantity);
      }
      
      return {
        id: response.data.id,
        name: response.data.name,
        price: salePrice,
        costPrice: response.data.costPrice,
        stockQuantity: stockQuantity,
      };
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Cria um novo produto
   */
  async createMenuItem(data: CreateProductRequest): Promise<MenuItem | null> {
    try {
      const response = await httpClient.post<ProductApiResponse>(PRODUCTS.ALL, data);
      
      return {
        id: response.data.id,
        name: response.data.name,
        price: response.data.salePrice,
        costPrice: response.data.costPrice,
        stockQuantity: response.data.stockQuantity,
      };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return null;
    }
  }
  
  /**
   * Atualiza o estoque de um produto
   */
  async updateMenuItemStock(id: number, quantity: number): Promise<MenuItem | null> {
    try {
      const payload: UpdateStockRequest = {
        productId: id,
        stockQuantity: quantity,
      };
      
      const response = await httpClient.patch<ProductApiResponse>(
        PRODUCTS.UPDATE_STOCK,
        payload
      );
      
      return {
        id: response.data.id,
        name: response.data.name,
        price: response.data.salePrice,
        costPrice: response.data.costPrice,
        stockQuantity: response.data.stockQuantity,
      };
    } catch (error) {
      console.error(`Erro ao atualizar estoque do produto ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Atualiza o preço de um produto
   */
  async updateMenuItemPrice(id: number, price: number): Promise<MenuItem | null> {
    try {
      const payload: UpdatePriceRequest = {
        productId: id,
        price,
      };
      
      const response = await httpClient.patch<ProductApiResponse>(
        PRODUCTS.UPDATE_PRICE,
        payload
      );
      
      return {
        id: response.data.id,
        name: response.data.name,
        price: response.data.salePrice,
        costPrice: response.data.costPrice,
        stockQuantity: response.data.stockQuantity,
      };
    } catch (error) {
      console.error(`Erro ao atualizar preço do produto ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Deleta um produto
   */
  async deleteMenuItem(id: number): Promise<boolean> {
    try {
      await httpClient.delete(PRODUCTS.BY_ID(id));
      return true;
    } catch (error) {
      console.error(`Erro ao deletar produto ${id}:`, error);
      return false;
    }
  }
}

// Exporta uma instância para uso em toda a aplicação
export const productService: ProductService = new ProductServiceImpl();
