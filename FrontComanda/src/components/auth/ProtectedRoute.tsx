import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../modules/auth";
import type { UserRole } from "../../modules/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redireciona para a rota apropriada com base no papel do usuário
    if (user.role === "MANAGER") {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === "WAITER") {
      return <Navigate to="/tables" replace />;
    } else {
      return <Navigate to="/menu" replace />;
    }
  }

  return <>{children}</>;
};
