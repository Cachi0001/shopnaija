
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Activity
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalAdmins: number;
    totalRevenue: number;
    totalProducts: number;
    totalOrders: number;
    activeStores: number;
    monthlyGrowth: number;
  };
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const statCards = [
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: <Users className="h-8 w-8 text-brand-800" />,
      description: "Active store owners",
      change: "+2 this month",
      trend: "up"
    },
    {
      title: "Total Revenue",
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      description: "This month",
      change: "+15% from last month",
      trend: "up"
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <Package className="h-8 w-8 text-blue-600" />,
      description: "Across all stores",
      change: "+180 this week",
      trend: "up"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingBag className="h-8 w-8 text-purple-600" />,
      description: "Completed orders",
      change: "+23 today",
      trend: "up"
    },
    {
      title: "Active Stores",
      value: stats.activeStores,
      icon: <Activity className="h-8 w-8 text-orange-600" />,
      description: "Currently active",
      change: `${stats.activeStores} of ${stats.totalAdmins}`,
      trend: "neutral"
    },
    {
      title: "Monthly Growth",
      value: `${stats.monthlyGrowth}%`,
      icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
      description: "Revenue growth",
      change: "Compared to last month",
      trend: stats.monthlyGrowth > 0 ? "up" : "down"
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            <div className="mt-2 flex items-center text-xs">
              <TrendingUp className={`h-3 w-3 mr-1 ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-400'
              }`} />
              <span className={`font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
