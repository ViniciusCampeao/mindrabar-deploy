import { useLocation, matchPath } from 'react-router-dom';

/**
 * A custom hook to check if a path matches the current location
 */
export function useRouteMatch(paths: string | string[]) {
  const location = useLocation();
  const pathsArray = Array.isArray(paths) ? paths : [paths];

  return pathsArray.some(path => matchPath(path, location.pathname));
}
