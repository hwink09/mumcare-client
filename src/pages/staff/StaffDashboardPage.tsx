import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrentUser } from "@/hooks/useAuth";
import { getAllOrders, updateOrderStatus, deleteOrder } from "@/services/orderService";
import { getProducts, updateProduct, deleteProduct } from "@/services/productService";
import { StaffBlogManagementPage } from "./StaffBlogManagementPage";
import { StaffVoucherManagementPage } from "./StaffVoucherManagementPage";

type StaffDashboardProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
};

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

type ProductItem = {
  _id: string;
  title: string;
  quantity: number;
  sold: number;
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  canceled: "Canceled",
};

export function StaffDashboardPage({ user, onLogout }: StaffDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "blogs" | "vouchers">("orders");

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const isStaff = useMemo(() => user?.role === "staff" || user?.role === "admin", [user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) {
      navigate("/staff/login");
      return;
    }
    if (!isStaff) {
      navigate("/");
      return;
    }
  }, [user, isStaff, navigate]);

  const loadOrders = async () => {
    setOrdersError(null);
    setOrdersLoading(true);
    try {
      const res = await getAllOrders({ limit: 50 });
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setOrders(list as OrderItem[]);
    } catch {
      setOrdersError("Failed to load orders. Please try again.");
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
        (list as any[]).map((p) => ({
          _id: p._id || p.id,
          title: p.title || p.name,
          quantity: Number(p.quantity ?? 0),
          sold: Number(p.sold ?? 0),
        }))
      );
    } catch {
      setProductsError("Failed to load inventory. Please try again.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      loadOrders();
      loadProducts();
    }
  }, [isStaff]);

  const getNextStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "confirmed";
      case "confirmed":
        return "shipped";
      case "shipped":
        return "delivered";
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      console.error(error);
      setOrdersError("Failed to update order. Please try again.");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    await handleStatusUpdate(orderId, "canceled");
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await deleteOrder(orderId);
      await loadOrders();
    } catch (error) {
      console.error(error);
      setOrdersError("Failed to delete order. Please try again.");
    }
  };

  const handleEditProductQuantity = async (productId: string, currentQty: number) => {
    const input = window.prompt("Enter new stock quantity:", String(currentQty));
    if (!input) return;
    const newQty = Number(input);
    if (Number.isNaN(newQty) || newQty < 0) {
      window.alert("Please enter a valid non-negative number.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("quantity", newQty.toString());
      await updateProduct(productId, formData);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Failed to update product. Please try again.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Failed to delete product. Please try again.");
    }
  };

  const activeTabClasses = (tab: "orders" | "inventory" | "blogs" | "vouchers") =>
    activeTab === tab
      ? "bg-slate-900 text-white shadow"
      : "bg-white/80 text-foreground border border-transparent hover:bg-white";

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-pink-600 shadow-sm">
              Staff Workspace
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Staff Operations</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Track and action customer orders, monitor inventory levels.
            </p>
          </div>

          <div className="w-full">
            <Card className="border-0 shadow-lg shadow-pink-100/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-pink-500 to-blue-500 text-white flex items-center justify-center font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Welcome back</div>
                    <div className="font-semibold text-lg">
                      {user?.firstName || 'Unknown'} {user?.lastName || ''}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-right">{user?.email || 'Unknown'}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Role</span>
                    <Badge className="capitalize" variant="secondary">{user?.role || 'unknown'}</Badge>
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
        </div>

        <div className="flex flex-wrap gap-3 rounded-2xl bg-white/70 p-3 shadow-sm w-fit">
          <Button className={activeTabClasses("orders")} onClick={() => setActiveTab("orders")}>Orders</Button>
          <Button className={activeTabClasses("inventory")} onClick={() => setActiveTab("inventory")}>Inventory</Button>
          <Button className={activeTabClasses("vouchers")} onClick={() => setActiveTab("vouchers")}>Vouchers</Button>
          <Button className={activeTabClasses("blogs")} onClick={() => setActiveTab("blogs")}>Blogs</Button>
        </div>

        <div className="space-y-4">
          {activeTab === "orders" && (
            <Card className="border-0 shadow-lg shadow-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Order queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ordersLoading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading orders...</div>
                ) : ordersError ? (
                  <div className="py-12 text-center text-red-600">{ordersError}</div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No orders found.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                      <div className="text-sm text-muted-foreground">
                        Showing {showCanceledOrders ? "all" : "active"} orders ({orders.length})
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setShowCanceledOrders((prev) => !prev)}
                      >
                        {showCanceledOrders ? "Hide" : "Show"} canceled orders
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Order ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Address
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Items
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Date
                            </th>

                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(showCanceledOrders ? orders : orders.filter((o) => o.status !== "canceled")).map((order) => {
                            const next = getNextStatus(order.status);
                            return (
                              <tr key={order._id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                  {order.orderCode || order._id}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {isAdmin ? (
                                    order.status === "delivered" || order.status === "canceled" ? (
                                      // Delivered/canceled orders are final — show locked badge
                                      <Badge variant="secondary" className="capitalize">
                                        {ORDER_STATUS_LABEL[order.status] || order.status}
                                      </Badge>
                                    ) : (
                                      <select
                                        value={order.status}
                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                      >
                                        {Object.entries(ORDER_STATUS_LABEL)
                                          .filter(([key]) => key !== "canceled") // cancel via button only
                                          .map(([key, label]) => (
                                            <option key={key} value={key}>
                                              {label}
                                            </option>
                                          ))}
                                      </select>
                                    )
                                  ) : (
                                    <Badge variant="secondary" className="capitalize">
                                      {ORDER_STATUS_LABEL[order.status] || order.status}
                                    </Badge>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                                  {order.address || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {order.products?.reduce((s, i) => s + i.count, 0) || 0}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                                </td>
                                <td className="px-4 py-3 text-right text-sm">
                                  <div className="flex items-center justify-end gap-2 flex-wrap">
                                    {isAdmin ? (
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteOrder(order._id)}>
                                        Delete
                                      </Button>
                                    ) : (
                                      next && (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          onClick={() => handleStatusUpdate(order._id, next)}
                                        >
                                          Mark {ORDER_STATUS_LABEL[next] || next}
                                        </Button>
                                      )
                                    )}
                                    {/* Cancel: only allowed before delivery */}
                                    {order.status !== "delivered" && order.status !== "canceled" && (
                                      <Button size="sm" variant="outline" onClick={() => handleCancelOrder(order._id)}>
                                        Cancel
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => window.alert(`Note support for order ${order.orderCode || order._id} is not available yet.`)}
                                    >
                                      Note
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card className="border-0 shadow-lg shadow-slate-100">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-lg">Inventory management</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {productsLoading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading inventory...</div>
                ) : productsError ? (
                  <div className="py-12 text-center text-red-600">{productsError}</div>
                ) : products.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No products found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Product Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
                            Available Stock
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-24">
                            Sold
                          </th>

                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((product) => (
                          <tr key={product._id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                              {product.title}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-medium">
                                {product.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {product.sold}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              {isAdmin && (
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditProductQuantity(product._id, product.quantity)}
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
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}




          {activeTab === "vouchers" && (
            <div className="mt-4">
              <StaffVoucherManagementPage user={user} onLogout={onLogout} isEmbedded />
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="mt-4">
              <StaffBlogManagementPage user={user} onLogout={onLogout} isEmbedded />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
