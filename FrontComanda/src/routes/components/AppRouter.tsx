import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ReactNode } from 'react';
import { routes } from '../config/routes';

interface AppRouterProps {
  children?: ReactNode;
}

/**
 * The main router component that renders all application routes
 */
export function AppRouter({ children }: AppRouterProps) {
  return (
    <BrowserRouter>
      {children}
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}
