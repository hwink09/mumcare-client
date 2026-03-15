import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/services/orderService";

const ORDER_STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
} as const;

type OrderProduct = {
  count: number;
  name?: string;
  price?: number;
};

type Order = {
  _id: string;
  orderCode?: string;
  status: keyof typeof ORDER_STATUS_LABEL | string;
  address?: string;
  products?: OrderProduct[];
  createdAt?: string;
  user?: { name?: string; email?: string };
};

export default function AdminOrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
            Admin Control Center
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Order management</h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl">
            View, update, or delete all orders in the system.
          </p>
        </div>
      {loading && <div className="py-4 text-center text-muted-foreground">Loading orders...</div>}
      {error && <div className="py-4 text-center text-red-600">{error}</div>}
      {!loading && !error && !orders.length && (
        <div className="py-4 text-center text-muted-foreground">No orders found.</div>
      )}
      <div className="flex flex-wrap gap-6">
        {orders.map((order) => (
          <div key={order._id} className="flex flex-col justify-between w-full md:w-[48%] lg:w-[32%] rounded-xl border border-slate-200 bg-white p-6 shadow transition hover:shadow-md">
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <span className="font-semibold text-lg">{order.orderCode || order._id}</span>
                <Badge variant="secondary" className="capitalize">
                  {ORDER_STATUS_LABEL[order.status as keyof typeof ORDER_STATUS_LABEL] || order.status}
                </Badge>
              </div>
              <div className="grid gap-1 text-sm text-muted-foreground mb-2">
                <div><b>Address:</b> {order.address || "-"}</div>
                <div><b>Ordered:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
                {order.user && (
                  <div><b>User:</b> {order.user.name} ({order.user.email})</div>
                )}
              </div>
              <div className="mb-2">
                <b>Items:</b>
                <ul className="list-disc ml-6">
                  {order.products?.map((prod, idx) => (
                    <li key={idx}>
                      {prod.name || "Unnamed"} x {prod.count}
                      {prod.price !== undefined && (
                        <span> - {prod.price.toLocaleString()}₫</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
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
      </div>
    </div>
  );
}
