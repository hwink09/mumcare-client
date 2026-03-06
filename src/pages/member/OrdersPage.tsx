import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_ORDERS } from "@/constants/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyOrders } from "@/services/orderService";

type OrderItem = {
  _id: string;
  orderCode?: string;
  status: string;
  address?: string;
  couponCode?: string | null;
  discountAmount?: number;
  createdAt?: string;
  products?: Array<{ productId: string; count: number }>;
};

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getMyOrders();
        const items = (res?.data || []) as OrderItem[];
        if (mounted) setOrders(items.length ? items : (MOCK_ORDERS as OrderItem[]));
      } catch {
        if (mounted) {
          setError("Đang hiển thị dữ liệu demo vì BE chưa sẵn sàng.");
          setOrders(MOCK_ORDERS as OrderItem[]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track your purchase and loyalty-eligible deliveries</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
        </div>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium mb-2">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first order from checkout.</p>
              <Button onClick={() => navigate("/products")}>Shop now</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{order.orderCode || `Order ${order._id.slice(-6).toUpperCase()}`}</span>
                    <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><span className="text-muted-foreground">Address:</span> {order.address || "-"}</div>
                  <div><span className="text-muted-foreground">Items:</span> {order.products?.reduce((s, i) => s + i.count, 0) || 0}</div>
                  <div><span className="text-muted-foreground">Voucher:</span> {order.couponCode || "None"}</div>
                  <div><span className="text-muted-foreground">Discount:</span> ${Number(order.discountAmount || 0).toFixed(2)}</div>
                  <div><span className="text-muted-foreground">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
