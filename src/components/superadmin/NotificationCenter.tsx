
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Search, 
  Check, 
  Trash2,
  ShoppingBag,
  UserPlus,
  MessageCircle,
  AlertTriangle,
  DollarSign
} from "lucide-react";

const NotificationCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock notifications data - replace with actual API call
  const mockNotifications = [
    {
      id: "1",
      type: "sale_notification",
      message: "New order placed by John Doe - Order #ORD-001",
      timestamp: "2024-01-15T10:30:00Z",
      is_read: false,
      recipient_id: "superadmin"
    },
    {
      id: "2",
      type: "admin_created",
      message: "New admin account created: Store ABC",
      timestamp: "2024-01-15T09:15:00Z",
      is_read: false,
      recipient_id: "superadmin"
    },
    {
      id: "3",
      type: "feedback_received",
      message: "New feedback received for Wireless Headphones",
      timestamp: "2024-01-14T16:45:00Z",
      is_read: true,
      recipient_id: "superadmin"
    },
    {
      id: "4",
      type: "payment_confirmed",
      message: "Payment confirmed for Order #ORD-002 - ₦25,000",
      timestamp: "2024-01-14T14:30:00Z",
      is_read: true,
      recipient_id: "superadmin"
    },
    {
      id: "5",
      type: "order_failed",
      message: "Payment failed for Order #ORD-003",
      timestamp: "2024-01-14T12:20:00Z",
      is_read: false,
      recipient_id: "superadmin"
    },
    {
      id: "6",
      type: "admin_deactivated",
      message: "Admin account deactivated: Store XYZ",
      timestamp: "2024-01-13T11:10:00Z",
      is_read: true,
      recipient_id: "superadmin"
    }
  ];

  // Mock query - replace with actual implementation
  const { data: notifications = mockNotifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => Promise.resolve(mockNotifications),
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "sale_notification":
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      case "admin_created":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "admin_deactivated":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "feedback_received":
        return <MessageCircle className="h-4 w-4 text-purple-600" />;
      case "payment_confirmed":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "order_failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "sale_notification":
      case "payment_confirmed":
        return "bg-green-50 border-green-200";
      case "admin_created":
        return "bg-blue-50 border-blue-200";
      case "feedback_received":
        return "bg-purple-50 border-purple-200";
      case "order_failed":
      case "admin_deactivated":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read);
  const readNotifications = filteredNotifications.filter(n => n.is_read);

  const salesNotifications = filteredNotifications.filter(n => 
    n.type === "sale_notification" || n.type === "payment_confirmed" || n.type === "order_failed"
  );

  const adminNotifications = filteredNotifications.filter(n => 
    n.type === "admin_created" || n.type === "admin_deactivated"
  );

  const feedbackNotifications = filteredNotifications.filter(n => 
    n.type === "feedback_received"
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unread
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unreadNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sales Alerts
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admin Alerts
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminNotifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="sales">
            Sales ({salesNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="admin">
            Admin ({adminNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Feedback ({feedbackNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <NotificationList notifications={filteredNotifications} getNotificationIcon={getNotificationIcon} getNotificationColor={getNotificationColor} />
        </TabsContent>

        <TabsContent value="unread">
          <NotificationList notifications={unreadNotifications} getNotificationIcon={getNotificationIcon} getNotificationColor={getNotificationColor} />
        </TabsContent>

        <TabsContent value="sales">
          <NotificationList notifications={salesNotifications} getNotificationIcon={getNotificationIcon} getNotificationColor={getNotificationColor} />
        </TabsContent>

        <TabsContent value="admin">
          <NotificationList notifications={adminNotifications} getNotificationIcon={getNotificationIcon} getNotificationColor={getNotificationColor} />
        </TabsContent>

        <TabsContent value="feedback">
          <NotificationList notifications={feedbackNotifications} getNotificationIcon={getNotificationIcon} getNotificationColor={getNotificationColor} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface NotificationListProps {
  notifications: any[];
  getNotificationIcon: (type: string) => JSX.Element;
  getNotificationColor: (type: string) => string;
}

const NotificationList = ({ notifications, getNotificationIcon, getNotificationColor }: NotificationListProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No notifications found
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`
                  p-4 border-b last:border-b-0 flex items-start gap-3 hover:bg-gray-50 transition-colors
                  ${!notification.is_read ? getNotificationColor(notification.type) : ''}
                `}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {notification.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                  <Button variant="ghost" size="sm">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
