import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, useMemo } from "react";

// Components
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import ProtectedRoute from "./components/ProtectedRoute";
import SubdomainRouter from "./components/SubdomainRouter";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StoreFront from "./pages/StoreFront";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create a stable component for the home route to prevent re-renders
const HomeRoute = () => {
  console.log('[App] Rendering SubdomainRouter on /');
  return (
    <SubdomainRouter>
      <LandingPage />
    </SubdomainRouter>
  );
};

const App = () => {
  try {
    console.log('[App] Rendering. Current route:', window.location.pathname);
    
    // Memoize the routes to prevent unnecessary re-renders
    const routes = useMemo(() => (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomeRoute />} />
        {/* Store front for specific subdomains */}
        <Route path="/:subdomain" element={<StoreFront />} />
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Super Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <DashboardLayout>
                <SuperAdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    ), []);

    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback message="Loading ShopNaija..." />}>
                {routes}
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('[App] Synchronous error during render:', err, window.location.pathname);
    throw err;
  }
};

export default App;
