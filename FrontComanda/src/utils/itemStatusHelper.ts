import { itemService } from '@/api/items';
import { ItemQueueApiResponse } from '@/api/items/item.interface';
// Usando o atalho '@' conforme configurado no tsconfig
import { ItemStatusType } from '@/types/item';

/**
 * Exemplo de uso do serviço para buscar itens por status
 */
async function buscarItensPorStatus(status: ItemStatusType): Promise<ItemQueueApiResponse[]> {
  try {
    // Busca itens pelo status específico
    const itens = await itemService.getItemsByStatus(status);
    
    console.log(`Encontrados ${itens.length} itens com status ${status}`);
    return itens;
  } catch (error) {
    console.error(`Erro ao buscar itens com status ${status}:`, error);
    return [];
  }
}

// Exemplo de como chamar a função, você pode importar o ItemStatus assim:
// import { ItemStatus } from '@/types/item';
//
// buscarItensPorStatus(ItemStatus.PENDING);
// buscarItensPorStatus(ItemStatus.PREPARING);
// buscarItensPorStatus(ItemStatus.DELIVERED);
// buscarItensPorStatus(ItemStatus.CANCELLED);

export { buscarItensPorStatus };
