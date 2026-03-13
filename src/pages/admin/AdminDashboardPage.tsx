import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityModal } from "@/components/admin/ActivityModal";
import type { CurrentUser } from "@/hooks/useAuth";

import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/services/orderService";

import {
  getProducts,
  updateProduct,
  deleteProduct,
} from "@/services/productService";

type AdminDashboardProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
};

type AdminTab = "users" | "reports" | "orders" | "products";

type OrderItem = {
  _id: string;
  orderCode?: string;
  status: string;
  address?: string;
  createdAt?: string;
  products?: Array<{ productId: string; count: number }>;
};

type ProductItem = {
  _id: string;
  title: string;
  quantity: number;
  sold: number;
};

type StatItem = {
  label: string;
  value: string;
  caption: string;
};

const statsByTab: Record<AdminTab, StatItem[]> = {
  users: [
    { label: "Total users", value: "1,248", caption: "12 new this week" },
    { label: "Active staff", value: "28", caption: "2 pending invites" },
    { label: "Blocked", value: "6", caption: "Review required" },
  ],
  reports: [
    { label: "Revenue", value: "$48.2k", caption: "Monthly to date" },
    { label: "Conversion", value: "3.8%", caption: "+0.4% vs last week" },
    { label: "Top product", value: "MumCare Plus", caption: "210 sold" },
  ],
  orders: [],
  products: [],
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
};

export function AdminDashboardPage({ user, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [showActivity, setShowActivity] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const loadOrders = async () => {
    setOrdersError(null);
    setOrdersLoading(true);

    try {
      const res = await getAllOrders({ limit: 50 });
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setOrders(list);
    } catch {
      setOrdersError("Failed to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsError(null);
    setProductsLoading(true);

    try {
      const res = await getProducts({ page: 1, limit: 50 });
      const list = Array.isArray(res) ? res : (res as any).data || [];

      setProducts(
        list.map((p: any) => ({
          _id: p._id || p.id,
          title: p.title || p.name,
          quantity: Number(p.quantity ?? 0),
          sold: Number(p.sold ?? 0),
        }))
      );
    } catch {
      setProductsError("Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "orders") loadOrders();
    if (activeTab === "products") loadProducts();
  }, [activeTab]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const order = orders.find((o) => o._id === orderId);

    if (order && order.status === "canceled" && status !== "canceled") {
      setOrdersError("Cannot change status from canceled.");
      return;
    }

    try {
      await updateOrderStatus(orderId, status);
      loadOrders();
    } catch {
      setOrdersError("Failed to update order.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await deleteOrder(orderId);
      loadOrders();
    } catch {
      setOrdersError("Failed to delete order.");
    }
  };

  const handleEditProductQuantity = async (
    productId: string,
    currentQty: number
  ) => {
    const input = window.prompt("Enter new stock quantity:", String(currentQty));
    if (!input) return;

    const newQty = Number(input);

    if (Number.isNaN(newQty) || newQty < 0) {
      alert("Invalid number");
      return;
    }

    try {
      await updateProduct(productId, { quantity: newQty });
      loadProducts();
    } catch {
      setProductsError("Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch {
      setProductsError("Failed to delete product.");
    }
  };

  const tabClass = (tab: AdminTab) =>
    activeTab === tab
      ? "bg-indigo-600 text-white"
      : "bg-white text-slate-700 border";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="container mx-auto px-4 py-10 relative">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <span className="px-8 py-2 rounded-full bg-white shadow text-blue-600 tracking-widest font-semibold border">
            ADMIN CONTROL CENTER
          </span>
        </div>

        {/* PROFILE */}
        <div className="absolute top-6 right-8 z-30">
          <div className="relative">
            <button
              className="w-12 h-12 rounded-full bg-indigo-600 text-white font-semibold text-lg shadow-lg hover:bg-indigo-700 transition focus:outline-none ring-2 ring-indigo-300 hover:ring-4 hover:scale-105 duration-200 animate-profile-glow"
              style={{ boxShadow: '0 4px 16px 0 rgba(80, 112, 255, 0.15)' }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user?.email?.[0]?.toUpperCase() || "A"}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow animate-fade-in">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50"
                  onClick={() => navigate("/admin/profile")}
                >
                  Profile admin
                </button>

                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  onClick={() => {
                    onLogout();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}

        <div className="flex gap-3 mb-6 flex-wrap mt-12">
          <Button className={tabClass("users")} onClick={() => setActiveTab("users")}>Users</Button>
          <Button className={tabClass("reports")} onClick={() => setActiveTab("reports")}>Reports</Button>
          <Button className={tabClass("orders")} onClick={() => setActiveTab("orders")}>Orders</Button>
          <Button className={tabClass("products")} onClick={() => setActiveTab("products")}>Products</Button>
        </div>

        {/* STATS */}

        {(["users","reports"] as AdminTab[]).includes(activeTab) && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {statsByTab[activeTab].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.caption}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ORDERS */}

        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Order management</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {ordersLoading && (
                <div className="text-center py-10">Loading orders...</div>
              )}

              {ordersError && (
                <div className="text-center text-red-500">{ordersError}</div>
              )}

              {!ordersLoading && !ordersError && orders.map((order) => (
                <div key={order._id} className="border rounded-xl p-4 flex justify-between">

                  <div>
                    <div className="font-semibold">
                      {order.orderCode || order._id}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {order.address}
                    </div>
                  </div>

                  <div className="flex gap-2">

                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      className="border rounded px-2"
                    >
                      {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteOrder(order._id)}
                    >
                      Delete
                    </Button>

                  </div>

                </div>
              ))}

            </CardContent>
          </Card>
        )}

        {/* PRODUCTS */}

        {activeTab === "products" && (
          <Card>
            <CardHeader>
              <CardTitle>Product management</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">

              {products.map((product) => (
                <div key={product._id} className="border rounded-xl p-4">

                  <div className="font-semibold">{product.title}</div>

                  <div className="text-sm text-muted-foreground">
                    Stock: {product.quantity} • Sold: {product.sold}
                  </div>

                  <div className="mt-3 flex gap-2">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleEditProductQuantity(product._id, product.quantity)
                      }
                    >
                      Edit stock
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </Button>

                  </div>

                </div>
              ))}

            </CardContent>
          </Card>
        )}

        {/* USERS */}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User management</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-2">

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Accounts & roles</h3>
                  <Button onClick={() => navigate("/admin/users")}>
                    Open user list
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold">Access audit</h3>
                  <Button onClick={() => setShowActivity(true)}>
                    Review activity
                  </Button>
                </CardContent>
              </Card>

            </CardContent>
          </Card>
        )}

        <ActivityModal
          isOpen={showActivity}
          onClose={() => setShowActivity(false)}
        />

      </div>
    </div>
  );
}

export default AdminDashboardPage;