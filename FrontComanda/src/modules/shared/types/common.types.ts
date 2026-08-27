import type { ReactNode } from "react";

export type TableStatus = "AVAILABLE" | "OCCUPIED";

export interface Table {
  id: number;
  number: number;
  name?: string;
  status: TableStatus;
  totalItems: number;
  totalValue: number;
  totalAmount: number;
  orders?: Order[];
  qrToken?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  costPrice?: number;
  stockQuantity?: number;
}

// Interface para itens de pedido usados apenas na UI (não no backend)
export interface OrderItemUI {
  name?: ReactNode;
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem: MenuItem;
}

// Interface para itens de pedido conforme retornados pelo backend
export interface OrderItem {
  itemId?: number; // ID do item para operações como exclusão
  menuItemId: number;
  quantity: number;
  price?: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  total: number;
}
