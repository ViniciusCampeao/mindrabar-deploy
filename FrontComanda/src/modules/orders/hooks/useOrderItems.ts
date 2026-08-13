/**
 * Hook personalizado para gerenciar itens do pedido
 */
import { useState, useCallback, useEffect } from 'react';
import { OrderItem } from '../../../modules/shared/types/common.types';
import ItemsService from '../../../services/Items';
import OrdersService from '../../../services/Orders';
import { naturalSort } from '../../../utils/sorting/naturalSort';

interface UseOrderItemsProps {
  orderId: number;
  initialItems?: OrderItem[];
  // onOrderUpdated foi removido para evitar ciclos infinitos
}

/**
 * Hook para gerenciar os itens do pedido
 */
export const useOrderItems = ({ 
  orderId,
  initialItems
}: UseOrderItemsProps) => {
  const [orderItems, setOrderItems] = useState(initialItems || [] as OrderItem[]);
  const [orderTotal, setOrderTotal] = useState(0); // Total vindo do backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  
  /**
   * Carrega os itens do pedido atual e o total do backend
   */
  const loadOrderItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar o pedido completo para obter o totalAmount
      const order = await OrdersService.getOrderById(orderId);
      
      if (order) {
        // Atualizar o total com o valor do backend
        setOrderTotal(order.total || 0);
        
        // Ordenar os itens alfabeticamente
        const sortedItems = [...(order.items || [])].sort((a: OrderItem, b: OrderItem) => 
          naturalSort(a, b, true)
        );
        
        setOrderItems(sortedItems);
        return sortedItems;
      }
      
      return [];
    } catch (error) {
      console.error("Erro ao carregar itens do pedido:", error);
      setError(error instanceof Error ? error.message : "Erro ao carregar itens do pedido");
      return [];
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  
  /**
   * Adiciona um item ao pedido atual
   */
  const addItem = useCallback(async (menuItemId: number, quantity: number, userId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const addedItem = await ItemsService.addItemToOrder(
        orderId,
        menuItemId,
        quantity,
        userId
      );

      if (addedItem) {
        // Recarregar a lista de itens
        await loadOrderItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      setError(error instanceof Error ? error.message : "Erro ao adicionar item ao pedido");
      return false;
    } finally {
      setLoading(false);
    }
  }, [orderId, loadOrderItems]);

  /**
   * Remove um item do pedido atual
   */
  const removeItem = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);

      const success = await ItemsService.removeItemFromOrder(itemId);

      if (success) {
        // Recarregar a lista de itens
        await loadOrderItems();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao remover item:", error);
      setError(error instanceof Error ? error.message : "Erro ao remover item do pedido");
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadOrderItems]);

  /**
   * Carrega os itens automaticamente quando o orderId mudar ou na inicialização
   */
  useEffect(() => {
    if (orderId) {
      console.log('[useOrderItems] Carregando itens para pedido:', orderId);
      // Sempre recarregar para garantir dados atualizados do backend
      loadOrderItems();
    }
  }, [orderId, loadOrderItems]);

  /**
   * Calcula o valor total do pedido usando o totalAmount do backend
   */
  const calculateTotal = useCallback(() => {
    // Sempre retorna o total do backend se o pedido foi carregado
    // Isso garante que pagamentos parciais sejam refletidos corretamente
    return orderTotal;
  }, [orderTotal]);

  return {
    orderItems,
    loading,
    error,
    loadOrderItems,
    addItem,
    removeItem,
    calculateTotal
  };
};