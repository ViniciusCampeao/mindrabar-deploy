import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth';
import { UserRole } from '../../modules/auth/types/user.types';
import { DEFAULT_ROLE_REDIRECTS, LOGIN_PATH } from '../config/types';
import { hasRouteAccess } from '../utils/routeUtils';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

/**
 * A route guard that ensures the user is authenticated and has the required role
 * @param children - The route content to render if authorized
 * @param allowedRoles - Roles that can access this route
 * @param redirectPath - Custom redirect path (defaults to login)
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectPath = LOGIN_PATH
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If user doesn't have required role, redirect to their home page
  if (user && allowedRoles && !hasRouteAccess(user.role, allowedRoles)) {
    const rolePath = DEFAULT_ROLE_REDIRECTS[user.role];
    return <Navigate to={rolePath} replace />;
  }

  return <>{children}</>;
}
