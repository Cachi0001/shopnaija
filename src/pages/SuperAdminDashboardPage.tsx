import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";

const SuperAdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <SuperAdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />
    </DashboardLayout>
  );
};

export default SuperAdminDashboardPage; 