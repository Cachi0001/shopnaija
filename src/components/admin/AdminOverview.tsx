
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminOverviewProps {
  orders: any[];
  feedback: any[];
}

export const AdminOverview = ({ orders, feedback }: AdminOverviewProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Recent Orders Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders && orders.length > 0 ? (
              orders.slice(0, 4).map((order, i) => (
                <div key={i} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-md">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                    {order.customer_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{order.customer_name || order.customer_email}</p>
                    <p className="text-sm text-muted-foreground">{order.order_reference || order.id} - ₦{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback && feedback.length > 0 ? (
              feedback.slice(0, 4).map((item, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-md hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`w-4 h-4 ${starIndex < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">• {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-2">{item.comment}</p>
                  <p className="text-xs text-right font-medium mt-1">- {item.customer_name}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No feedback yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
