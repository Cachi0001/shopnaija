import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminService } from "@/services/AdminService";
import { useQuery } from "@tanstack/react-query";

interface SubdomainRouterProps {
  children: ReactNode;
  adminContent: ReactNode;
}

const SubdomainRouter = ({ children, adminContent }: SubdomainRouterProps) => {
  try {
    console.log('[SubdomainRouter] Rendering. children:', !!children, 'adminContent:', !!adminContent);
    const { subdomain, loading } = useAuth();

    // Query to get admin info for this subdomain
    const { data: adminData, isLoading: adminLoading } = useQuery({
      queryKey: ['admin', subdomain],
      queryFn: () => subdomain ? AdminService.getAdminBySubdomain(subdomain) : null,
      enabled: !!subdomain && subdomain !== 'superadmin',
    });

    if (loading || adminLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ShopNaija...</p>
          </div>
        </div>
      );
    }

    // If we have a subdomain but it's not superadmin, check if admin exists and is active
    if (subdomain && subdomain !== 'superadmin') {
      if (!adminData) {
        return (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">GrowSmallBeez</h1>
              <p className="text-xl text-gray-600 mb-8">Store not found</p>
              <p className="text-gray-500">The store you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        );
      }

      if (!adminData.is_active) {
        return (
          <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">GrowthSmallBeez</h1>
              <p className="text-xl text-gray-600 mb-8">Account Inactive</p>
              <p className="text-gray-500">This store is temporarily unavailable.</p>
            </div>
          </div>
        );
      }

      // Pass admin data to admin content for branding
      return <>{adminContent}</>;
    }

    // If we have superadmin subdomain or no subdomain, show main content
    return <>{children}</>;
  } catch (err) {
    console.error('[SubdomainRouter] Error during render:', err);
    throw err;
  }
};

export default SubdomainRouter;
