import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingFallback from "@/components/LoadingFallback";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "superadmin" | "admin" | "customer" | undefined;
}

function TimeoutFallback() {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h2>Authentication Timeout</h2>
      <p>We're having trouble verifying your session. Please try reloading the page.</p>
      <button
        style={{ marginTop: 16, padding: '8px 24px', fontSize: 16 }}
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  );
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading, timeout } = useAuth();

  if (timeout) {
    return <TimeoutFallback />;
  }

  if (loading) {
    return <LoadingFallback timeout={15000} message="Checking authentication..." />;
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