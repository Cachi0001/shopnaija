
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";

const TopPerformingStores = () => {
  const stores = [
    {
      id: 1,
      name: "TechStore Nigeria",
      owner: "Michael Okafor",
      subdomain: "techstore",
      revenue: 850000,
      orders: 156,
      growth: 15.2,
      status: "active"
    },
    {
      id: 2,
      name: "Fashion Hub",
      owner: "Sarah Johnson",
      subdomain: "fashionhub",
      revenue: 720000,
      orders: 203,
      growth: 12.8,
      status: "active"
    },
    {
      id: 3,
      name: "ElectroStore",
      owner: "David Adebayo",
      subdomain: "electrostore",
      revenue: 650000,
      orders: 134,
      growth: -2.1,
      status: "active"
    },
    {
      id: 4,
      name: "Home & Living",
      owner: "Grace Okonkwo",
      subdomain: "homeliving",
      revenue: 580000,
      orders: 189,
      growth: 8.4,
      status: "active"
    },
    {
      id: 5,
      name: "Sports Central",
      owner: "James Olatunji",
      subdomain: "sportscentral",
      revenue: 420000,
      orders: 98,
      growth: 5.7,
      status: "active"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Stores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stores.map((store, index) => (
            <div key={store.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-brand-100 text-brand-800 rounded-full font-medium text-sm">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-200">
                    {store.owner.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-500">{store.owner}</p>
                  <p className="text-xs text-gray-400">{store.subdomain}.growthsmallbeez.com</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900">₦{store.revenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{store.orders} orders</p>
                <div className="flex items-center justify-end mt-1">
                  {store.growth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${
                    store.growth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {store.growth > 0 ? '+' : ''}{store.growth}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformingStores;
