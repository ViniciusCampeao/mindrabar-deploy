import { ReactNode } from 'react';
import { UserRole } from '../../modules/auth/types/user.types';

/**
 * Interface for route configuration
 */
export interface RouteConfig {
  path: string;
  element: ReactNode;
  roles?: UserRole[];
  isPublic?: boolean;
  redirectPath?: string;
  children?: RouteConfig[];
}

/**
 * Interface for navigation item (used in menus)
 */
export interface NavigationItem {
  path: string;
  label: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavigationItem[];
}

/**
 * Type for role-based redirect map
 */
export type RoleRedirectMap = {
  [key in UserRole]: string;
};

/**
 * Default role-based redirects
 */
export const DEFAULT_ROLE_REDIRECTS: RoleRedirectMap = {
  MANAGER: '/dashboard',
  WAITER: '/waiter-tables',
  ADMIN: '/dashboard',
  USER: '/tables'
};

/**
 * Login redirect path (where to redirect after login if no other path is specified)
 */
export const LOGIN_PATH = '/login';

/**
 * Unauthorized access redirect path
 */
export const UNAUTHORIZED_PATH = '/login';
