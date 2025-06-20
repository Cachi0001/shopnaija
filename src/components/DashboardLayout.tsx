
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Home, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  Bell, 
  Settings, 
  LogOut,
  Users,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/login");
  };

  const handleNavClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setSidebarOpen(false);
  };

  const superAdminNavItems = [
    { name: "Overview", tab: "overview", icon: BarChart3 },
    { name: "Admins", tab: "admins", icon: Users },
    { name: "Referrals", tab: "referrals", icon: TrendingUp },
    { name: "Feedback", tab: "feedback", icon: MessageCircle },
    { name: "Alerts", tab: "notifications", icon: Bell },
  ];

  const adminNavItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: Home },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
    { name: "Feedback", path: "/admin/feedback", icon: MessageCircle },
    { name: "Settings", path: "/admin/settings", icon: Settings }
  ];

  const navigationItems = isSuperAdmin ? superAdminNavItems : adminNavItems;

  const renderNavItem = (item: any) => {
    if (isSuperAdmin) {
      return (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.tab)}
          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md ${
            activeTab === item.tab ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
          {item.name}
        </button>
      );
    }
    // Regular admin navigation
    return (
      <Link
        key={item.name}
        to={item.path}
        className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
      >
        <item.icon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
        {item.name}
      </Link>
    );
  };

  const renderMobileNavItem = (item: any) => {
     if (isSuperAdmin) {
      return (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.tab)}
          className={`flex items-center w-full px-2 py-2 text-base font-medium rounded-md ${
            activeTab === item.tab ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
          {item.name}
        </button>
      );
    }
    return (
       <Link
          key={item.name}
          to={item.path}
          className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
          onClick={() => setSidebarOpen(false)}
        >
          <item.icon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
          {item.name}
        </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {user?.logo_url ? (
            <img 
              src={user.logo_url} 
              alt="Logo" 
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-xl font-bold text-brand-800">
              {isSuperAdmin ? "Admin Panel" : user?.website_name || "Store Admin"}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-white p-5 shadow-lg transform transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-brand-800">
                  {isSuperAdmin ? "Admin Panel" : user?.website_name || "Store Admin"}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="space-y-1">
                {navigationItems.map(renderMobileNavItem)}
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-10">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-brand-800">
              {isSuperAdmin ? "Admin Panel" : user?.website_name || "Store Admin"}
            </span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="flex-1 px-3 space-y-1">
              {navigationItems.map(renderNavItem)}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 w-full"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        {/* Top navigation bar */}
        <div className="hidden lg:flex h-16 border-b border-gray-200 bg-white items-center justify-between px-6">
          <h1 className="text-lg font-semibold">
            {isSuperAdmin ? "Super Admin Dashboard" : user?.website_name || "Store Admin"}
          </h1>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full mr-4"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarFallback className="bg-brand-800 text-white">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={isSuperAdmin ? "/settings" : "/admin/settings"} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
