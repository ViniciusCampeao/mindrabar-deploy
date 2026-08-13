import type { ReactNode } from "react";

export interface Table {
  id: number;
  number: number;
  name?: string;
  status: "available" | "occupied";
  totalItems: number;
  totalValue: number;
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
