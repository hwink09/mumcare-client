import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityModal } from "@/components/admin/ActivityModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { formatVND } from "@/lib/currency";

type AdminDashboardProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  activeTab?: AdminTab;
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

const ADMIN_TAB_ROUTES: Record<AdminTab, string> = {
  users: "/admin/users",
  reports: "/admin",
  orders: "/admin/orders",
  products: "/admin/products",
  categories: "/admin/categories",
  blogs: "/admin/blogs",
  vouchers: "/admin/vouchers",
};

export function AdminDashboardPage({
  user,
  onLogout,
  activeTab = "reports",
}: AdminDashboardProps) {
  const navigate = useNavigate();

  const [showActivity, setShowActivity] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderPendingDelete, setOrderPendingDelete] = useState<OrderItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [stats, setStats] = useState<Record<AdminTab, StatItem[]>>({
    users: [
      { label: "Total users", value: "-", caption: "Loading..." },
      { label: "Active staff", value: "-", caption: "Loading..." },
      { label: "Blocked", value: "-", caption: "Loading..." },
    ],
    reports: [
      { label: "Total Revenue", value: "-", caption: "Loading..." },
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
      const revenueStr = formatVND(totalRevenue);
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

    if (order && (order.status === "canceled" || order.status === "delivered")) {
      setOrdersError("Cannot change status of a delivered or canceled order.");
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

  const openDeleteDialog = (order: OrderItem) => {
    setOrderPendingDelete(order);
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setOrderPendingDelete(null);
  };

  const handleDeleteOrder = async () => {
    if (!orderPendingDelete) return;

    setDeleteSubmitting(true);
    try {
      await deleteOrder(orderPendingDelete._id);
      loadOrders();
      loadStats();
      setOrderPendingDelete(null);
    } catch {
      setOrdersError("Failed to delete order.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const tabClass = (tab: AdminTab) =>
    activeTab === tab
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-white text-slate-700 border hover:bg-slate-50";

  const handleTabChange = (tab: AdminTab) => {
    if (activeTab === tab) return;
    navigate(ADMIN_TAB_ROUTES[tab]);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10 relative">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="h-8 rounded-full px-4 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/50"
            >
              Logout
            </Button>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="mt-3 text-base text-muted-foreground max-w-xl">
            Manage users, products, orders and monitor store performance.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-6 flex-wrap mt-8">
          <Button className={tabClass("users")} onClick={() => handleTabChange("users")}>Users</Button>
          <Button className={tabClass("reports")} onClick={() => handleTabChange("reports")}>Reports</Button>
          <Button className={tabClass("orders")} onClick={() => handleTabChange("orders")}>Orders</Button>
          <Button className={tabClass("products")} onClick={() => handleTabChange("products")}>Products</Button>
          <Button className={tabClass("categories")} onClick={() => handleTabChange("categories")}>Categories</Button>
          <Button className={tabClass("blogs")} onClick={() => handleTabChange("blogs")}>Blogs</Button>
          <Button className={tabClass("vouchers")} onClick={() => handleTabChange("vouchers")}>Vouchers</Button>
        </div>

        {/* STATS */}
        {(["users","reports"] as AdminTab[]).includes(activeTab) && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {stats[activeTab].map((stat) => (
              <Card key={stat.label} className="border-0 shadow-lg shadow-slate-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-50/50 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="pt-6 relative z-10">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-bold mt-2 mb-1 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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
                    {order.status === "delivered" || order.status === "canceled" ? (
                      <Badge
                        variant="secondary"
                        className={`capitalize px-3 py-1.5 text-sm font-medium ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    ) : (
                      <>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="border rounded px-3 py-1.5 min-w-30 bg-slate-50 text-sm font-medium"
                        >
                          {Object.entries(ORDER_STATUS_LABEL)
                            .filter(([k]) => k !== "canceled")
                            .map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(order)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <ConfirmDialog
          open={Boolean(orderPendingDelete)}
          title="Delete Order"
          description={
            orderPendingDelete
              ? `Delete order ${orderPendingDelete.orderCode || orderPendingDelete._id} permanently?`
              : "Delete this order?"
          }
          confirmText={deleteSubmitting ? "Deleting..." : "Delete"}
          confirmDisabled={deleteSubmitting}
          cancelDisabled={deleteSubmitting}
          onConfirm={handleDeleteOrder}
          onCancel={closeDeleteDialog}
        />

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
