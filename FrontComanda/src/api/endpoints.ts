/**
 * Arquivo com todos os endpoints da API
 * 
 * Este arquivo centraliza todos os endpoints da API
 * para facilitar manutenção e evitar duplicação
 */

// Base URL — vem do build (.env / VITE_API_URL). Fallback pro dom\u00ednio antigo.
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'https://api.mindra.me';

// Autenticação e Usuários
export const AUTH = {
  LOGIN: '/auth/login',
  ME: '/auth/me',
  USER_CREATE: '/user/create',
};

// Usuários
export const USERS = {
  ALL: '/user',
  BY_ID: (id: number) => `/user/${id}`,
  BY_COMPANY: (companyId: number) => `/user/company?companyId=${companyId}`,
  UPDATE: (id: number) => `/user/update/${id}`,
  DELETE: (id: number) => `/user/delete/${id}`,
};

// Mesas
export const TABLES = {
  ALL: '/table',
  BY_ID: (id: number) => `/table/${id}`,
  UPDATE_STATUS: (id: number) => `/tables/${id}/status`,
  UPDATE_NAME: (id: number) => `/table/${id}/name`,
  GET_BY_COMPANY: (companyId: number) => `/table/company?companyId=${companyId}`,
};

// Pedidos
export const ORDERS = {
  ALL: '/order',
  BY_ID: (id: number) => `/order/${id}`,
  BY_TABLE: (tableId: number) => `/order/table/${tableId}`,
  BY_STATUS: (status: string) => `/order/status/${status}`,
  SALES_BY_DAY: (day: string) => `/order/day?day=${day}`,
  UPDATE_STATUS: (id: number) => `/order/${id}/status`,
  PAYMENT: (id: number) => `/order/${id}/payment`,
};

// Itens de Pedido
export const ITEMS = {
  ALL: '/item',
  BY_ID: (id: number) => `/item/${id}`,
  BY_ORDER: (orderId: number) => `/item/order/${orderId}`,
  BY_PRODUCT: (productId: number) => `/item/product/${productId}`,
  BY_USER: (userId: number) => `/item/user/${userId}`,
  BY_STATUS: (status: string) => `/item/status/${status}`,
  UPDATE_STATUS: (id: number) => `/item/${id}/status`,
  UPDATE_QUANTITY: (id: number) => `/item/${id}/quantity`,
};

// Produtos/Menu Items
export const PRODUCTS = {
  ALL: '/product',
  BY_ID: (id: number) => `/product/${id}`,
  BY_COMPANY: (companyId: number) => `/product/company?companyId=${companyId}`,
  UPDATE_STOCK: '/product/stock',
  UPDATE_PRICE: '/product/price',
};

// Endpoints para gerenciar empresas
export const COMPANIES = {
  DETAILS: '/company/details',
  BY_ID: (id: number) => `/company/${id}`,
  CREATE: '/company/create',
};

// Impressão via RabbitMQ
export const PRINT = {
  SEND: '/print',
};