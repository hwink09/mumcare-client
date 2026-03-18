import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  ShoppingBag,
} from "lucide-react";
import { getMyOrders } from "@/services/orderService";
import { formatVND } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  canceled: "bg-red-100 text-red-700 border-red-200",
};

type OrderItem = {
  _id: string;
  orderCode?: string;
  status: string;
  createdAt?: string;
  finalTotal?: number;
  address?: string;
  products?: Array<{ count?: number }>;
};

const formatOrderDate = (value?: string) => {
  if (!value) return "Date unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusLabel = (value?: string) => {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ");
};

const getItemCount = (order: OrderItem) => (
  Array.isArray(order.products)
    ? order.products.reduce((sum, item) => sum + Number(item?.count || 0), 0)
    : 0
);

interface OrdersPageProps {
  isLoggedIn: boolean;
}

export function OrdersPage({ isLoggedIn }: OrdersPageProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders],
  );

  const activeCount = useMemo(
    () => orders.filter((order) => !["delivered", "canceled"].includes(order.status)).length,
    [orders],
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.finalTotal || 0), 0),
    [orders],
  );

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getMyOrders();
        const items = Array.isArray(res) ? res : ((res as { data?: OrderItem[] }).data || []);
        if (mounted) setOrders(items);
      } catch {
        if (mounted) setError("Failed to load orders. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_24%,rgba(239,246,255,0.88)_100%)]">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm hover:bg-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Order History</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">My Orders</h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
              Track every purchase in one place, open an order to view details, and leave reviews after delivery.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {loading ? (
                <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="flex items-center justify-center px-6 py-16 text-slate-500">
                    Loading orders...
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
                <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Package className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900">No orders yet</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Once you place your first order, it will show up here with status updates and review access.
                    </p>
                    <Button
                      onClick={() => navigate("/products")}
                      className="mt-6 h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                    >
                      Shop now
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => {
                  const displayCode = order.orderCode || `Order #${order._id.slice(-6).toUpperCase()}`;
                  const statusColor = STATUS_COLOR[order.status] || "bg-slate-100 text-slate-600 border-slate-200";
                  const itemCount = getItemCount(order);

                  return (
                    <Link key={order._id} to={`/orders/${order._id}`} className="group block">
                      <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-0.5">
                        <CardContent className="p-5 sm:p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(236,72,153,0.12),rgba(14,165,233,0.14))] text-slate-900">
                                <ShoppingBag className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Order code
                                </p>
                                <p className="mt-2 truncate font-mono text-lg font-black text-slate-950 transition-colors group-hover:text-pink-600">
                                  {displayCode}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                                    {formatOrderDate(order.createdAt)}
                                  </span>
                                  <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700">
                                    {itemCount || 0} items
                                  </span>
                                  {order.address ? (
                                    <span className="max-w-full truncate rounded-full bg-pink-50 px-3 py-1 font-medium text-pink-700">
                                      {order.address}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                              {Number(order.finalTotal || 0) > 0 ? (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left lg:text-right">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    Total
                                  </p>
                                  <p className="mt-1 text-lg font-black text-slate-950">
                                    {formatVND(Number(order.finalTotal))}
                                  </p>
                                </div>
                              ) : null}

                              <Badge className={`capitalize border px-3 py-1 text-xs font-semibold ${statusColor}`}>
                                {getStatusLabel(order.status)}
                              </Badge>

                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors group-hover:text-slate-700">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Your order snapshot</h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Total orders</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">{orders.length}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active orders</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">{activeCount}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">{deliveredCount}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Total spent
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{formatVND(totalSpent)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Review Reminder</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Delivered orders unlock reviews</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Open a delivered order to review the products you received. Once submitted, those ratings will
                  appear in My Reviews.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/reviews")}
                  className="mt-5 h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  Open My Reviews
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
