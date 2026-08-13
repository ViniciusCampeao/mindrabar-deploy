import { Navigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth';
import { DEFAULT_ROLE_REDIRECTS, LOGIN_PATH } from '../config/types';

/**
 * A component that redirects users to their role-specific home page
 * Used for the root path or when a generic redirect is needed
 */
export function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  if (user) {
    const redirectPath = DEFAULT_ROLE_REDIRECTS[user.role];
    return <Navigate to={redirectPath} replace />;
  }

  // Fallback to login if something goes wrong
  return <Navigate to={LOGIN_PATH} replace />;
}
