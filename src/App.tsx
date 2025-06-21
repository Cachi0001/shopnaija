import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";

// Components
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import LandingPage from "./pages/LandingPage";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
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

const App = () => {
  try {
    console.log('[App] Rendering. Current route:', window.location.pathname);

    return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
          <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Sonner />
          <Suspense fallback={<LoadingFallback message="Loading ShopNaija..." />}>
            <Routes>
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
                        <SuperAdminDashboardPage />
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

                  {/* Default route */}
                  <Route path="/" element={<LandingPage />} />

              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
            </AuthProvider>
        </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);
  } catch (err) {
    console.error('[App] Synchronous error during render:', err, window.location.pathname);
    throw err;
  }
};

export default App;
