
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/services/orderService";

type OrderProduct = {
  count: number;
};

type Order = {
  _id: string;
  orderCode?: string;
  status: keyof typeof ORDER_STATUS_LABEL | string;
  address?: string;
  products?: OrderProduct[];
  createdAt?: string;
};

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
} as const;

export function AdminOrdersMini() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({ limit: 5 });
      const list: Order[] = Array.isArray(res) ? res : (res && res.data) || [];
      setOrders(list);
      setError(null);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch {
      setError("Failed to update order. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await deleteOrder(orderId);
      await loadOrders();
    } catch {
      setError("Failed to delete order. Please try again.");
    }
  };

  if (loading) return <div className="py-4 text-center text-muted-foreground">Loading orders...</div>;
  if (error) return <div className="py-4 text-center text-red-600">{error}</div>;
  if (!orders.length) return <div className="py-4 text-center text-muted-foreground">No orders found.</div>;

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">{order.orderCode || order._id}</span>
              <Badge variant="secondary" className="capitalize">
                {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] || order.status}
              </Badge>
            </div>
            <div className="mt-1 grid gap-1 text-xs text-muted-foreground">
              <div>Address: {order.address || "-"}</div>
              <div>Items: {order.products?.reduce((s: number, i: OrderProduct) => s + i.count, 0) || 0}</div>
              <div>Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={order.status}
              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order._id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}