/**
 * Hook personalizado para gerenciar itens do menu
 */
import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../../../modules/shared/types/common.types';
import MenuItemsService from '../../../services/MenuItems';
import { naturalSortMenuItems } from '../../../utils/sorting';

/**
 * Hook para gerenciar a lista de itens do menu e filtragem
 */
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState([] as MenuItem[]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([] as MenuItem[]);
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);

  /**
   * Carrega todos os itens do menu
   */
  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar todos os itens do menu disponíveis
      const menuData = await MenuItemsService.getAllMenuItems();
      
      // Ordenar os itens do menu alfabeticamente
      const sortedMenuItems = [...menuData].sort((a: MenuItem, b: MenuItem) => 
        naturalSortMenuItems(a, b, true)
      );
      
      setMenuItems(sortedMenuItems);
      setFilteredMenuItems(sortedMenuItems);
      
      return sortedMenuItems;
    } catch (error) {
      console.error("Erro ao carregar itens do menu:", error);
      setError(error instanceof Error ? error.message : "Erro ao carregar itens do menu");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Efeito para filtrar os itens do menu com base no termo de pesquisa
   */
  useEffect(() => {
    if (menuItems.length > 0) {
      if (menuSearchTerm) {
        // Filtrar itens com base no termo de pesquisa
        const filtered = menuItems.filter((item) => 
          item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())
        );
        setFilteredMenuItems(filtered);
      } else {
        // Se não houver termo de pesquisa, mostrar todos os itens
        setFilteredMenuItems(menuItems);
      }
    }
  }, [menuItems, menuSearchTerm]);

  return {
    menuItems,
    filteredMenuItems,
    menuSearchTerm,
    setMenuSearchTerm,
    loading,
    error,
    loadMenuItems
  };
};