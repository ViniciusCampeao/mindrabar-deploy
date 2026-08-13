import { useNavigate, useLocation } from 'react-router-dom';
import { DEFAULT_ROLE_REDIRECTS } from '../config/types';
import { UserRole } from '../../modules/auth/types/user.types';
import { buildPath, createNavigateOptions, getRedirectPath } from '../utils/routeUtils';

/**
 * A custom hook for navigation with enhanced features
 * Extends React Router's useNavigate with app-specific utilities
 */
export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    /**
     * Navigate to a path
     */
    goTo: (path: string, options?: { replace?: boolean; state?: unknown }) => {
      navigate(path, options);
    },

    /**
     * Navigate to a path with parameters
     */
    goToWithParams: (
      basePath: string, 
      params: Record<string, string | number>,
      options?: { replace?: boolean; state?: unknown }
    ) => {
      const path = buildPath(basePath, params);
      navigate(path, options);
    },

    /**
     * Navigate to the home page for a specific user role
     */
    goToRoleHome: (role: UserRole) => {
      const path = DEFAULT_ROLE_REDIRECTS[role];
      navigate(path, { replace: true });
    },

    /**
     * Navigate back to the previous page in history
     */
    goBack: () => {
      navigate(-1);
    },

    /**
     * Navigate to the redirect path from state or fallback path
     */
    goToRedirectPath: (fallbackPath: string) => {
      const redirectPath = getRedirectPath(location.state, fallbackPath);
      navigate(redirectPath, createNavigateOptions());
    },

    /**
     * The current path
     */
    currentPath: location.pathname,

    /**
     * The current location object
     */
    location
  };
}
