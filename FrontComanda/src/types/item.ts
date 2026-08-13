/**
 * Constantes para os possíveis status de um item
 */
export const ItemStatus = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;

/**
 * Tipo para os status de um item
 */
export type ItemStatusType = typeof ItemStatus[keyof typeof ItemStatus];

/**
 * Tipo de Item para uso na UI
 */
export interface Item {
  itemId: number;
  userId: number;
  orderId: number;
  productId: number;
  quantity: number;
  status: ItemStatusType;
  createdAt: string;
  updatedAt: string;
}
