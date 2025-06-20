
import { useState } from "react";
import { Bell, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'admin_created' | 'payment_confirmed' | 'order_failed' | 'feedback_received';
}

export function NotificationDropdown() {
  // Mock notifications for now - will be replaced with actual Supabase data
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Admin Registration',
      message: 'John Doe has registered as a new admin',
      timestamp: '2 minutes ago',
      isRead: false,
      type: 'admin_created'
    },
    {
      id: '2',
      title: 'Payment Confirmed',
      message: 'Payment of ₦15,000 received for Order #1234',
      timestamp: '15 minutes ago',
      isRead: false,
      type: 'payment_confirmed'
    },
    {
      id: '3',
      title: 'Feedback Received',
      message: 'New customer feedback submitted',
      timestamp: '1 hour ago',
      isRead: true,
      type: 'feedback_received'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'admin_created':
        return '👤';
      case 'payment_confirmed':
        return '💰';
      case 'order_failed':
        return '❌';
      case 'feedback_received':
        return '💬';
      default:
        return '📢';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" style={{ color: '#00A862' }} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              style={{ backgroundColor: '#00A862' }}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-gray-500">
              No notifications yet
            </div>
          </DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {!notification.isRead && (
                    <Circle className="h-2 w-2 fill-current" style={{ color: '#00A862' }} />
                  )}
                </div>
                <p className="text-xs text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400">{notification.timestamp}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center">
          <span className="text-sm" style={{ color: '#00A862' }}>View all notifications</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
