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

import { getProducts } from "@/services/productService";

import { getUsers } from "@/services/userService";
import { AdminUserManagementPage } from "./AdminUserManagementPage";
import { AdminProductManagementPage } from "./AdminProductManagementPage";
import { AdminCategoryManagementPage } from "./AdminCategoryManagementPage";
import { AdminBlogManagementPage } from "./AdminBlogManagementPage";
import { AdminVoucherManagementPage } from "./AdminVoucherManagementPage";

type AdminDashboardProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
};

type AdminTab = "users" | "reports" | "orders" | "products" | "categories" | "blogs" | "vouchers";

type OrderItem = {
  _id: string;
  orderCode?: string;
  status: string;
  address?: string;
  createdAt?: string;
  products?: Array<{ productId: string; count: number }>;
  totalAmount?: number;
  checkoutTotal?: number;
};

type StatItem = {
  label: string;
  value: string;
  caption: string;
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

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [stats, setStats] = useState<Record<AdminTab, StatItem[]>>({
    users: [
      { label: "Total users", value: "-", caption: "Loading..." },
      { label: "Active staff", value: "-", caption: "Loading..." },
      { label: "Blocked", value: "-", caption: "Loading..." },
    ],
    reports: [
      { label: "Total Revenue", value: "$-", caption: "Loading..." },
      { label: "Delivered Orders", value: "-", caption: "Loading..." },
      { label: "Total Products", value: "-", caption: "Loading..." },
    ],
    orders: [],
    products: [],
    categories: [],
    blogs: [],
    vouchers: [],
  });

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

  const loadStats = async () => {
    try {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        getUsers({ limit: 1000 }).catch(err => { console.error("Error fetching users for stats:", err); return []; }),
        getAllOrders({ limit: 1000 }).catch(err => { console.error("Error fetching orders for stats:", err); return []; }),
        getProducts({ limit: 1000 }).catch(err => { console.error("Error fetching products for stats:", err); return []; })
      ]);

      const usersList = Array.isArray(usersRes) ? usersRes : usersRes?.data || [];
      const ordersList = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [];
      const productsList = Array.isArray(productsRes) ? productsRes : productsRes?.data || [];

      // Users Stats
      const totalUsers = usersList.length;
      const staffUsers = usersList.filter((u: any) => u.role === "staff").length;
      const blockedUsers = usersList.filter((u: any) => u.isBlocked).length;

      // Reports Stats
      const deliveredOrders = ordersList.filter((o: any) => o.status === "delivered");
      let totalRevenue = 0;
      deliveredOrders.forEach((o: any) => {
          if (typeof o.finalTotal !== 'undefined') {
              totalRevenue += Number(o.finalTotal);
          } else if (o.totalAmount) {
              totalRevenue += Number(o.totalAmount);
          } else if (o.checkoutTotal) {
              totalRevenue += Number(o.checkoutTotal);
          }
      });
      const revenueStr = totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "$0.00";
      const totalProductsCount = productsList.length;

      setStats({
        users: [
          { label: "Total users", value: totalUsers.toString(), caption: "All registered users" },
          { label: "Active staff", value: staffUsers.toString(), caption: "With Staff role" },
          { label: "Blocked", value: blockedUsers.toString(), caption: "Currently banned" },
        ],
        reports: [
          { label: "Total Revenue", value: revenueStr, caption: "From delivered orders" },
          { label: "Delivered Orders", value: deliveredOrders.length.toString(), caption: "Successfully completed" },
          { label: "Total Products", value: totalProductsCount.toString(), caption: "In catalog" },
        ],
        orders: [],
        products: [],
        categories: [],
        blogs: [],
        vouchers: [],
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

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

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      if (activeTab === "orders") loadOrders();
    }
  }, [isAdmin, activeTab]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const order = orders.find((o) => o._id === orderId);

    if (order && order.status === "canceled" && status !== "canceled") {
      setOrdersError("Cannot change status from canceled.");
      return;
    }

    try {
      await updateOrderStatus(orderId, status);
      loadOrders();
      loadStats();
    } catch {
      setOrdersError("Failed to update order.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      await deleteOrder(orderId);
      loadOrders();
      loadStats();
    } catch {
      setOrdersError("Failed to delete order.");
    }
  };

  const tabClass = (tab: AdminTab) =>
    activeTab === tab
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-white text-slate-700 border hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dashboard Overview</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Manage users, products, orders and monitor store performance.
            </p>
          </div>

          <Card className="border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg shadow-indigo-200/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Signed in as</div>
                  <div className="font-semibold text-lg">
                    {user?.firstName || "Admin"} {user?.lastName || ""}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right">{user?.email || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="secondary">Administrator</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onLogout();
                  navigate("/login");
                }}
                className="w-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-6 flex-wrap mt-8">
          <Button className={tabClass("users")} onClick={() => setActiveTab("users")}>Users</Button>
          <Button className={tabClass("reports")} onClick={() => setActiveTab("reports")}>Reports</Button>
          <Button className={tabClass("orders")} onClick={() => setActiveTab("orders")}>Orders</Button>
          <Button className={tabClass("products")} onClick={() => setActiveTab("products")}>Products</Button>
          <Button className={tabClass("categories")} onClick={() => setActiveTab("categories")}>Categories</Button>
          <Button className={tabClass("blogs")} onClick={() => setActiveTab("blogs")}>Blogs</Button>
          <Button className={tabClass("vouchers")} onClick={() => setActiveTab("vouchers")}>Vouchers</Button>
        </div>

        {/* STATS */}
        {(["users","reports"] as AdminTab[]).includes(activeTab) && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {stats[activeTab].map((stat) => (
              <Card key={stat.label} className="border-0 shadow-lg shadow-slate-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-6 relative z-10">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold mt-2 mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.caption}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === "orders" && (
          <Card className="border-0 shadow-lg shadow-slate-100">
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ordersLoading && (
                <div className="text-center py-10">Loading orders...</div>
              )}
              {ordersError && (
                <div className="text-center text-red-500">{ordersError}</div>
              )}
              {!ordersLoading && !ordersError && orders.map((order) => (
                <div key={order._id} className="border rounded-xl p-4 flex justify-between bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="font-semibold text-lg text-indigo-950">
                      {order.orderCode || order._id}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {order.address}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }
                      className="border rounded px-3 py-1.5 min-w-[120px] bg-slate-50 text-sm font-medium"
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
          <div className="mt-4">
            <AdminProductManagementPage user={user} onLogout={onLogout} isEmbedded />
          </div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
           <div className="mt-4">
            <AdminUserManagementPage user={user} onLogout={onLogout} isEmbedded />
          </div>
        )}

        {/* CATEGORIES */}
        {activeTab === "categories" && (
           <div className="mt-4">
            <AdminCategoryManagementPage user={user} onLogout={onLogout} isEmbedded />
          </div>
        )}

        {/* BLOGS */}
        {activeTab === "blogs" && (
           <div className="mt-4">
            <AdminBlogManagementPage user={user} onLogout={onLogout} isEmbedded />
          </div>
        )}

        {/* VOUCHERS */}
        {activeTab === "vouchers" && (
           <div className="mt-4">
            <AdminVoucherManagementPage user={user} onLogout={onLogout} isEmbedded />
          </div>
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