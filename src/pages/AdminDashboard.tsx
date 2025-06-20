
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import ProductManagement from "@/components/admin/ProductManagement";
import AdminSettings from "@/components/admin/AdminSettings";
import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminOrdersTab } from "@/components/admin/AdminOrdersTab";
import { AdminFeedbackTab } from "@/components/admin/AdminFeedbackTab";
import { MobileHeader } from "@/components/admin/MobileHeader";

const AdminDashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Load categories
  useEffect(() => {
    if (user?.id) {
      loadCategories();
    }
  }, [user?.id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await CategoryService.getCategoriesByAdmin(user!.id);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Fetch real statistics
  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products', user?.id],
    queryFn: () => user?.id ? ProductService.getProductsByAdmin(user.id) : [],
    enabled: !!user?.id,
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: feedback } = useQuery({
    queryKey: ['admin-feedback', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.filter(order => order.payment_status === 'completed')?.length || 0;
  const totalFeedback = feedback?.length || 0;
  const MAX_PRODUCTS = 600;
  const remainingProducts = MAX_PRODUCTS - totalProducts;

  // Calculate recent changes
  const getRecentChange = (data: any[], timeframe: 'week' | 'today' | 'month') => {
    if (!data || data.length === 0) return 0;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeframe) {
      case 'today':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return 0;
    }
    
    return data.filter(item => new Date(item.created_at) >= cutoffDate).length;
  };

  const productsThisWeek = getRecentChange(products, 'week');
  const ordersToday = getRecentChange(orders?.filter(o => o.payment_status === 'completed'), 'today');
  const feedbackThisWeek = getRecentChange(feedback, 'week');

  // Handle loading timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (authLoading || dashboardLoading) {
        console.error('Dashboard loading timeout after 30 seconds');
        setLoadingTimeout(true);
        setDashboardLoading(false);
      }
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, [authLoading, dashboardLoading]);

  // Handle dashboard initialization
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth loading complete, user:', user?.id);
      
      if (user) {
        const loadDashboard = async () => {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Dashboard data loaded successfully');
            setDashboardLoading(false);
          } catch (error) {
            console.error('Dashboard loading error:', error);
            setDashboardLoading(false);
          }
        };
        
        loadDashboard();
      } else {
        setDashboardLoading(false);
      }
    }
  }, [authLoading, user]);

  const handleRetry = () => {
    console.log('Retrying dashboard load...');
    setLoadingTimeout(false);
    setDashboardLoading(true);
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTabChange = (tabId: string) => {
    console.log('Changing tab to:', tabId);
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleProductSaved = () => {
    setEditingProduct(null);
    refetchProducts();
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview orders={orders || []} feedback={feedback || []} />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <AdminOrdersTab orders={orders || []} />;
      case "feedback":
        return <AdminFeedbackTab feedback={feedback || []} />;
      case "settings":
        return <AdminSettings />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Section Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">The requested section could not be found.</p>
            </CardContent>
          </Card>
        );
    }
  };

  // Show loading timeout error
  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Loading Timeout</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              The dashboard is taking longer than expected to load. This might be due to a network issue or server problem.
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Loading
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'} 
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">
            {authLoading ? "Authenticating..." : "Loading dashboard data..."}
          </p>
          <p className="text-gray-300 text-xs mt-4">
            If this takes more than 30 seconds, an error message will appear
          </p>
        </div>
      </div>
    );
  }

  // Show error if no user after loading
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-yellow-600">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You need to be logged in to access the admin dashboard.
            </p>
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ml-0">
        <MobileHeader setSidebarOpen={setSidebarOpen} />

        <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          <AdminHeader
            user={user}
            categories={categories}
            editingProduct={editingProduct}
            onProductSaved={handleProductSaved}
            remainingProducts={remainingProducts}
            uploading={uploading}
            setUploading={setUploading}
          />

          <AdminStats
            totalProducts={totalProducts}
            totalOrders={totalOrders}
            totalFeedback={totalFeedback}
            productsThisWeek={productsThisWeek}
            ordersToday={ordersToday}
            feedbackThisWeek={feedbackThisWeek}
          />

          <div className="space-y-6">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
