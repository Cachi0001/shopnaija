import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminService } from "@/services/AdminService";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import StoreFront from "@/pages/StoreFront";

interface SubdomainRouterProps {
  children: ReactNode;
}

const SubdomainRouter = ({ children }: SubdomainRouterProps) => {
  try {
    console.log('[SubdomainRouter] Rendering. children:', !!children);
    const authContext = useAuth();
    const location = useLocation();

    // Add null check for auth context
    if (!authContext) {
      console.error('[SubdomainRouter] Auth context is null');
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Authentication context error. Please refresh the page.</p>
          </div>
        </div>
      );
    }

    const { subdomain, loading } = authContext;

    // List of paths that should bypass subdomain routing
    const bypassPaths = ['/login', '/auth', '/forgot-password', '/reset-password', '/auth/callback', '/dashboard', '/admin'];
    const shouldBypass = bypassPaths.some(path => location.pathname.startsWith(path));

    // If this is an admin/auth route, let React Router handle it
    if (shouldBypass) {
      return <>{children}</>;
    }

    // Query to get admin info for this subdomain (with error handling)
    const { data: adminData, isLoading: adminLoading, error: adminError } = useQuery({
      queryKey: ['admin', subdomain],
      queryFn: async () => {
        if (!subdomain || subdomain === 'superadmin') return null;
        try {
          return await AdminService.getAdminBySubdomain(subdomain);
        } catch (error) {
          console.error('[SubdomainRouter] Error fetching admin data:', error);
          return null;
        }
      },
      enabled: !!subdomain && subdomain !== 'superadmin',
      retry: 1, // Only retry once to avoid infinite loops
      retryOnMount: false,
    });

    if (loading || adminLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ShopNaija...</p>
          </div>
        </div>
      );
    }

    // Handle admin service errors gracefully
    if (adminError) {
      console.error('[SubdomainRouter] Admin service error:', adminError);
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">ShopNaija</h1>
            <p className="text-xl text-gray-600 mb-8">Service temporarily unavailable</p>
            <p className="text-gray-500">Please try again later or contact support.</p>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-4">ShopNaija</h1>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-4">ShopNaija</h1>
              <p className="text-xl text-gray-600 mb-8">Account Inactive</p>
              <p className="text-gray-500">This store is temporarily unavailable.</p>
            </div>
          </div>
        );
      }

      // Show StoreFront for valid admin subdomains
      return <StoreFront />;
    }

    // If we have superadmin subdomain or no subdomain, show main content (LandingPage)
    return <>{children}</>;
  } catch (err) {
    console.error('[SubdomainRouter] Error during render:', err);
    // Instead of throwing, render an error fallback
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">ShopNaija</h1>
          <p className="text-xl text-gray-600 mb-8">Something went wrong</p>
          <p className="text-gray-500">Please refresh the page or try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default SubdomainRouter;
