
import { useState, useEffect } from "react";
import { Bell, ShoppingBag, User, Phone, Calendar, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SaleNotification {
  id: string;
  customer_name: string;
  total_amount: number;
  order_reference: string;
  customer_phone?: string;
  timestamp: string;
  items?: string[];
}

export function AdminNotificationCard({ notification, onDismiss }: { 
  notification: SaleNotification; 
  onDismiss: () => void; 
}) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleContactCustomer = () => {
    if (notification.customer_phone) {
      const message = encodeURIComponent(
        `Hello ${notification.customer_name}! Thank you for your order ${notification.order_reference} worth ₦${notification.total_amount.toLocaleString()}. We're preparing your items for delivery. We'll keep you updated!`
      );
      window.open(`https://wa.me/${notification.customer_phone}?text=${message}`, '_blank');
    }
    
    toast({
      title: "WhatsApp opened",
      description: "You can now chat with your customer",
    });
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <Card className="w-80 shadow-2xl border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎉 New Sale!</h3>
                <p className="text-green-100 text-sm">You've got money!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-green-100" />
              <span className="font-semibold">{notification.customer_name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">₦{notification.total_amount.toLocaleString()}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-green-100">
              <Calendar className="h-4 w-4" />
              <span>Order: {notification.order_reference}</span>
            </div>

            {notification.customer_phone && (
              <div className="flex items-center space-x-2 text-sm text-green-100">
                <Phone className="h-4 w-4" />
                <span>{notification.customer_phone}</span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Button
              onClick={handleContactCustomer}
              className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold"
            >
              Contact Customer on WhatsApp
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-white hover:bg-white/20"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
