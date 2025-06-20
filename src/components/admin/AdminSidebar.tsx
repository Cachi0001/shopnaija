
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Home, Package, ShoppingBag, MessageCircle, Settings } from "lucide-react";

interface AdminSidebarProps {
  user: any;
  activeTab: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

export const AdminSidebar = ({
  user,
  activeTab,
  sidebarOpen,
  setSidebarOpen,
  onTabChange,
  onLogout
}: AdminSidebarProps) => {
  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "feedback", label: "Feedback", icon: MessageCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id ? 'bg-green-50 text-green-600 border-r-2 border-green-600' : 'text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
          
          <button
            onClick={onLogout}
            className="w-full flex items-center px-6 py-3 text-left hover:bg-red-50 text-red-600 transition-colors mt-4"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </nav>
      </div>
    </>
  );
};
