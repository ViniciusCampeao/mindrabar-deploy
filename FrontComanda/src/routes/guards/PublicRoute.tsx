import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth';
import { DEFAULT_ROLE_REDIRECTS } from '../config/types';

interface PublicRouteProps {
  children: ReactElement;
}

/**
 * A route guard for public routes that redirects authenticated users to their home page
 * @param children - The route content to render for unauthenticated users
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuth();

  // If already authenticated, redirect to role-based home page
  if (user) {
    const redirectPath = DEFAULT_ROLE_REDIRECTS[user.role];
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
