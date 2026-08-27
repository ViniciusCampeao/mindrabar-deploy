/**
 * Tipos do fluxo público de pedido via QR Code (cliente, sem autenticação)
 */

export interface PublicTableInfo {
  tableId: number;
  tableName: string;
  companyId: number;
  companyName: string;
}

export interface PublicMenuProduct {
  id: number;
  companyId: number;
  name: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  categoryId: number | null;
  categoryName: string | null;
}

export interface StartSessionRequest {
  name: string;
  phone: string;
}

export type TableSessionStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CLOSED';

export interface StartSessionResponse {
  sessionId: number;
  sessionToken: string;
  tableId: number;
  tableName: string;
  customerName: string;
  status: TableSessionStatus;
}

export interface CustomerOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface ItemCreateResponse {
  itemId: number;
  userId: number | null;
  orderId: number;
  productId: number;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  orderedBy: string;
}

export interface BillResponse {
  tableId: number;
  tableName: string;
  items: BillItem[];
  totalAmount: number;
  amountPending: number;
}

export type SessionItemOrderStatus = 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface SessionItemStatus {
  itemId: number;
  productName: string;
  quantity: number;
  status: SessionItemOrderStatus;
  createdAt: string;
  updatedAt: string;
}
