import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  return (
    <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="w-8" /> {/* Spacer */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">{user.email}</span>
            <button onClick={logout} className="text-xs px-2 py-1 bg-red-500 text-white rounded">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileHeader;
