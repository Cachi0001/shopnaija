
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, MessageCircle, TrendingUp } from "lucide-react";

interface AdminStatsProps {
  totalProducts: number;
  totalOrders: number;
  totalFeedback: number;
  productsThisWeek: number;
  ordersToday: number;
  feedbackThisWeek: number;
}

export const AdminStats = ({
  totalProducts,
  totalOrders,
  totalFeedback,
  productsThisWeek,
  ordersToday,
  feedbackThisWeek
}: AdminStatsProps) => {
  const Stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: <Package className="h-8 w-8 text-brand-800" />,
      description: "In your store",
      change: `+${productsThisWeek} this week`,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingBag className="h-8 w-8 text-brand-800" />,
      description: "Completed orders",
      change: `+${ordersToday} today`,
    },
    {
      title: "Total Feedback",
      value: totalFeedback,
      icon: <MessageCircle className="h-8 w-8 text-brand-800" />,
      description: "Customer reviews",
      change: `+${feedbackThisWeek} this week`,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Stats.map((stat, i) => (
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
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="font-medium text-green-600">{stat.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
