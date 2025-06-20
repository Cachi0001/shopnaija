
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminOrdersTabProps {
  orders: any[];
}

export const AdminOrdersTab = ({ orders }: AdminOrdersTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm">
                        {order.order_reference || order.id.slice(0, 8)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>
                          <div className="font-medium">{order.customer_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.customer_email}</div>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        ₦{Number(order.total_amount).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
