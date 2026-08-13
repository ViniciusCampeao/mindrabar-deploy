/**
 * Application route paths centralized
 * This allows for easier route management and prevents magic strings
 */

export const AUTH_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',
};

export const MANAGER_PATHS = {
  DASHBOARD: '/dashboard',
  TABLES: '/tables',
  MENU: '/menu',
  ORDERS: '/orders',
  SALES: '/sales',
  QUEUE: '/queue',
  USER_MANAGEMENT: '/user-management',
};

export const WAITER_PATHS = {
  TABLES: '/waiter-tables',
  ORDERS: '/waiter-orders',
  MENU: '/menu',
};

export const COMMON_PATHS = {
  ROOT: '/',
  MENU: '/menu',
};

// All paths combined
export const PATHS = {
  ...AUTH_PATHS,
  ...MANAGER_PATHS,
  ...WAITER_PATHS,
  ...COMMON_PATHS,
};

export default PATHS;
