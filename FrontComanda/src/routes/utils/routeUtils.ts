import { NavigateOptions } from 'react-router-dom';
import { UserRole } from '../../modules/auth/types/user.types';
import { DEFAULT_ROLE_REDIRECTS } from '../config/types';

/**
 * Builds a parametrized route path
 * @param basePath - The base path template (e.g., '/user/:id')
 * @param params - Object with param values
 * @returns Constructed path with params replaced
 */
export function buildPath(basePath: string, params: Record<string, string | number>): string {
  let path = basePath;
  
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, String(value));
  });
  
  return path;
}

/**
 * Gets the home page path for a specific user role
 * @param role - User role
 * @returns The home path for that role
 */
export function getHomePathForRole(role: UserRole): string {
  return DEFAULT_ROLE_REDIRECTS[role];
}

/**
 * Determines if a user has access to a specific route based on their role
 * @param userRole - The user's role
 * @param allowedRoles - Roles that can access the route
 * @returns True if the user has access
 */
export function hasRouteAccess(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  return allowedRoles.includes(userRole);
}

/**
 * Creates navigation options with from state
 * @param from - The path user is coming from
 * @returns Navigation options for react-router
 */
export function createNavigateOptions(from?: string): NavigateOptions {
  return {
    replace: true,
    state: from ? { from } : undefined
  };
}

/**
 * Gets the redirect path from location state
 * @param locationState - The location state object
 * @param defaultPath - Default path to return if no from path is found
 * @returns The path to redirect to
 */
export function getRedirectPath(
  locationState: unknown,
  defaultPath: string
): string {
  if (
    locationState &&
    typeof locationState === 'object' &&
    'from' in locationState &&
    typeof locationState.from === 'object' &&
    locationState.from &&
    'pathname' in locationState.from &&
    typeof locationState.from.pathname === 'string'
  ) {
    return locationState.from.pathname;
  }
  
  return defaultPath;
}
