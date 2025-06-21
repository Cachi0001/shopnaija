import { ReactNode } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminService } from "@/services/AdminService";
import { useQuery } from "@tanstack/react-query";
import StoreFront from "@/pages/StoreFront";

interface PathRouterProps {
  children: ReactNode;
}

const PathRouter = ({ children }: PathRouterProps) => {
  const { adminSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Bypass admin path routing for these routes
  const bypassPaths = ['/login', '/auth', '/dashboard'];
  const shouldBypass = bypassPaths.some(path => location.pathname.startsWith(path));

  // Fetch admin data if in admin path
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['admin', adminSlug],
    queryFn: () => AdminService.getAdminBySlug(adminSlug || ''),
    enabled: !!adminSlug && !shouldBypass,
  });

  if (loading || isLoading) {
    return <div className="flex justify-center p-8">Loading store...</div>;
  }

  // Handle admin store routes
  if (adminSlug && !shouldBypass) {
    if (!adminData) {
      return <div>Store not found</div>;
    }
    return <StoreFront admin={adminData} />;
  }

  return <>{children}</>;
};

export default PathRouter;