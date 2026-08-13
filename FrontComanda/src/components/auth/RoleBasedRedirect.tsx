import { Navigate } from "react-router-dom";
import { useAuth } from "../../modules/auth";

export const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "MANAGER") {
    return <Navigate to="/dashboard" replace />;
  }
  else {
    return <Navigate to="/tables" replace />;
  }
};

export default RoleBasedRedirect;
