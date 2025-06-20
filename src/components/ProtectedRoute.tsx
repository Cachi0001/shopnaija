import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "superadmin" | "admin" | "customer" | undefined;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleHierarchy = {
    'customer': 0,
    'admin': 1,
    'superadmin': 2,
  };

  // Get the numeric level of the user's actual role.
  // Use a default (e.g., -1 for unknown role) if user.role is unexpectedly not one of the defined roles.
  const actualRoleLevel = user.role ? roleHierarchy[user.role] : -1;

  const requiredRoleLevel = requiredRole ? roleHierarchy[requiredRole] : 0;

  const userHasSufficientRole = actualRoleLevel >= requiredRoleLevel;

  if (requiredRole && !userHasSufficientRole) {
    console.warn(`Access Denied: User role '${user.role}' (level ${actualRoleLevel}) does not meet required role '${requiredRole}' (level ${requiredRoleLevel}).`);

    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "customer") {
      return <Navigate to="/" replace />;
    } else if (user.role === "superadmin") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;