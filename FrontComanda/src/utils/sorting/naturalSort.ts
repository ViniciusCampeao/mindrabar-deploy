/**
 * Utilitários para ordenação natural de strings e objetos
 */
import { MenuItem, OrderItem } from "../../modules/shared/types/common.types";

/**
 * Realiza uma ordenação natural de strings, considerando números
 * como valores numéricos e não como caracteres
 * 
 * @param nameA Primeira string para comparação
 * @param nameB Segunda string para comparação
 * @param isAsc Flag para determinar ordenação ascendente (true) ou descendente (false)
 * @returns Valor numérico para uso em funções de ordenação
 */
export const naturalSortByName = (nameA: string, nameB: string, isAsc = true) => {
  // Extrai números do texto para comparação correta
  const regex = /(\d+)|(\D+)/g;
  const aParts = nameA.match(regex) || [];
  const bParts = nameB.match(regex) || [];
  
  const len = Math.min(aParts.length, bParts.length);
  
  // Compara cada parte, tratando números como números e texto como texto
  for (let i = 0; i < len; i++) {
    const aValue = aParts[i];
    const bValue = bParts[i];
    
    // Se ambas as partes são números, compara como números
    const aNum = parseInt(aValue);
    const bNum = parseInt(bValue);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      const diff = isAsc ? aNum - bNum : bNum - aNum;
      if (diff !== 0) return diff;
    } 
    // Senão, compara como texto
    else {
      const diff = isAsc ? 
        aValue.localeCompare(bValue) : 
        bValue.localeCompare(aValue);
      if (diff !== 0) return diff;
    }
  }
  
  // Se as partes comuns são iguais, a string mais curta vem primeiro
  return isAsc ? 
    aParts.length - bParts.length : 
    bParts.length - aParts.length;
};

/**
 * Realiza ordenação natural de objetos OrderItem com base no nome
 * 
 * @param a Primeiro item do pedido
 * @param b Segundo item do pedido
 * @param isAsc Flag para determinar ordenação ascendente (true) ou descendente (false)
 * @returns Valor numérico para uso em funções de ordenação
 */
export const naturalSort = (a: OrderItem, b: OrderItem, isAsc = true) => {
  const aName = a.menuItem?.name || `Item #${a.menuItemId}`;
  const bName = b.menuItem?.name || `Item #${b.menuItemId}`;
  
  return naturalSortByName(aName, bName, isAsc);
};

/**
 * Realiza ordenação natural de objetos MenuItem com base no nome
 * 
 * @param a Primeiro item do menu
 * @param b Segundo item do menu
 * @param isAsc Flag para determinar ordenação ascendente (true) ou descendente (false)
 * @returns Valor numérico para uso em funções de ordenação
 */
export const naturalSortMenuItems = (a: MenuItem, b: MenuItem, isAsc = true) => {
  return naturalSortByName(a.name, b.name, isAsc);
};