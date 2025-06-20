
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  UserPlus, 
  ShoppingBag, 
  Package, 
  MessageCircle,
  DollarSign
} from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "admin_created",
      title: "New admin registered",
      description: "Sarah Johnson created a new store: 'Fashion Hub'",
      time: "2 hours ago",
      icon: <UserPlus className="h-4 w-4" />,
      color: "bg-green-100 text-green-600"
    },
    {
      id: 2,
      type: "order_placed",
      title: "Large order received",
      description: "₦150,000 order placed at TechStore by John Doe",
      time: "4 hours ago",
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 3,
      type: "product_added",
      title: "New products added",
      description: "FashionHub added 15 new products to their store",
      time: "6 hours ago",
      icon: <Package className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 4,
      type: "feedback_received",
      title: "Customer feedback",
      description: "5-star review received for ElectroStore",
      time: "8 hours ago",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: 5,
      type: "revenue_milestone",
      title: "Revenue milestone",
      description: "Monthly revenue exceeded ₦2M for the first time",
      time: "1 day ago",
      icon: <DollarSign className="h-4 w-4" />,
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
