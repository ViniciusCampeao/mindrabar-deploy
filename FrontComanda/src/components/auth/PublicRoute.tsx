import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../../modules/auth";

interface PublicRouteProps {
  children: ReactElement;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user } = useAuth();

  if (user) {
    if (user.role === "MANAGER") {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === "WAITER") {
      return <Navigate to="/tables" replace />;
    } else {
      return <Navigate to="/menu" replace />;
    }
  }

  return children;
}
