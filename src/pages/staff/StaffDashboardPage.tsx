import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error";
import { deleteProduct, getProducts, updateProduct } from "@/services/productService";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import toast from "react-hot-toast";
import { StaffBlogManagementPage } from "./StaffBlogManagementPage";
import { StaffVoucherManagementPage } from "./StaffVoucherManagementPage";
import { StaffChatDashboard } from "./StaffChatDashboard";

type StaffTab = "orders" | "inventory" | "blogs" | "vouchers" | "chat";

type StaffDashboardProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  activeTab?: StaffTab;
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

const STAFF_TAB_ROUTES: Record<StaffTab, string> = {
  orders: "/staff",
  inventory: "/staff/inventory",
  blogs: "/staff/blogs",
  vouchers: "/staff/vouchers",
  chat: "/staff/chat",
};

const isFinalOrderStatus = (status: string) => status === "delivered" || status === "canceled";

const getOrderStatusOptions = () => Object.keys(ORDER_STATUS_LABEL);

export function StaffDashboardPage({
  user,
  onLogout,
  activeTab = "orders",
}: StaffDashboardProps) {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [editingInventoryProduct, setEditingInventoryProduct] = useState<ProductItem | null>(null);
  const [stockInputValue, setStockInputValue] = useState("");
  const [stockDialogError, setStockDialogError] = useState<string | null>(null);
  const [stockDialogSubmitting, setStockDialogSubmitting] = useState(false);
  const [deletingInventoryProduct, setDeletingInventoryProduct] = useState<ProductItem | null>(null);
  const [deleteDialogSubmitting, setDeleteDialogSubmitting] = useState(false);

  const isStaff = useMemo(() => user?.role === "staff" || user?.role === "admin", [user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!isStaff) {
      navigate("/");
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
        (list as any[]).map((product) => ({
          _id: product._id || product.id,
          title: product.title || product.name,
          quantity: Math.max(0, Number(product.quantity ?? 0)),
          sold: Math.max(0, Number(product.sold ?? 0)),
        })),
      );
    } catch {
      setProductsError("Failed to load inventory. Please try again.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (!isStaff) return;

    if (activeTab === "orders") {
      loadOrders();
    }

    if (activeTab === "inventory") {
      loadProducts();
    }
  }, [isStaff, activeTab]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    const order = orders.find((item) => item._id === orderId);
    if (!order || order.status === status) return;

    if (isFinalOrderStatus(order.status)) {
      const msg = "Cannot change status of a delivered or canceled order.";
      setOrdersError(msg);
      toast.error(msg);
      return;
    }

    setOrdersError(null);
    setUpdatingOrderId(orderId);

    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success(`Order status updated to ${ORDER_STATUS_LABEL[status] || status}.`);
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error, "Failed to update order. Please try again.");
      setOrdersError(msg);
      toast.error(msg);
    } finally {
      setUpdatingOrderId((current) => (current === orderId ? null : current));
    }
  };

  const openEditProductDialog = (product: ProductItem) => {
    setEditingInventoryProduct(product);
    setStockInputValue(String(product.quantity));
    setStockDialogError(null);
  };

  const closeEditProductDialog = () => {
    if (stockDialogSubmitting) return;

    setEditingInventoryProduct(null);
    setStockInputValue("");
    setStockDialogError(null);
  };

  const handleEditProductQuantity = async () => {
    if (!editingInventoryProduct) return;

    const normalizedInput = stockInputValue.trim();
    const newQty = Number(normalizedInput);
    if (!normalizedInput || Number.isNaN(newQty) || newQty < 0) {
      const msg = "Please enter a valid non-negative number.";
      setStockDialogError(msg);
      toast.error(msg);
      return;
    }

    setStockDialogSubmitting(true);
    setStockDialogError(null);

    try {
      const formData = new FormData();
      formData.append("quantity", newQty.toString());
      await updateProduct(editingInventoryProduct._id, formData);
      await loadProducts();
      toast.success(`Updated stock for "${editingInventoryProduct.title}".`);
      setEditingInventoryProduct(null);
      setStockInputValue("");
      setStockDialogError(null);
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error, "Failed to update product. Please try again.");
      setStockDialogError(msg);
      setProductsError(msg);
      toast.error(msg);
    } finally {
      setStockDialogSubmitting(false);
    }
  };

  const openDeleteProductDialog = (product: ProductItem) => {
    setDeletingInventoryProduct(product);
  };

  const closeDeleteProductDialog = () => {
    if (deleteDialogSubmitting) return;

    setDeletingInventoryProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!deletingInventoryProduct) return;

    setDeleteDialogSubmitting(true);
    try {
      await deleteProduct(deletingInventoryProduct._id);
      await loadProducts();
      toast.success(`Deleted "${deletingInventoryProduct.title}" successfully.`);
      setDeletingInventoryProduct(null);
    } catch (error) {
      console.error(error);
      const msg = getErrorMessage(error, "Failed to delete product. Please try again.");
      setProductsError(msg);
      toast.error(msg);
    } finally {
      setDeleteDialogSubmitting(false);
    }
  };

  const handleTabChange = (tab: StaffTab) => {
    if (activeTab === tab) return;
    navigate(STAFF_TAB_ROUTES[tab]);
  };

  const tabClass = (tab: StaffTab) =>
    activeTab === tab
      ? "bg-indigo-600 text-white hover:bg-indigo-700"
      : "bg-white text-slate-700 border hover:bg-slate-50";

  const canEditInventory = isStaff;
  const canDeleteInventory = isAdmin;
  const visibleOrders = useMemo(
    () => (showCanceledOrders ? orders : orders.filter((order) => order.status !== "canceled")),
    [orders, showCanceledOrders],
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10 relative">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Staff Control Center
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="h-8 rounded-full bg-white/50 px-4 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Logout
            </Button>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Dashboard Overview</h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Manage order flow, inventory, blogs, and voucher operations from one workspace.
          </p>
        </div>

        <div className="mt-8 mb-6 flex flex-wrap gap-3">
          <Button className={tabClass("orders")} onClick={() => handleTabChange("orders")}>
            Orders
          </Button>
          <Button className={tabClass("inventory")} onClick={() => handleTabChange("inventory")}>
            Inventory
          </Button>
          <Button className={tabClass("vouchers")} onClick={() => handleTabChange("vouchers")}>
            Vouchers
          </Button>
          <Button className={tabClass("blogs")} onClick={() => handleTabChange("blogs")}>
            Blogs
          </Button>
          <Button className={tabClass("chat")} onClick={() => handleTabChange("chat")}>
            Live Chat
          </Button>
        </div>

        {activeTab === "orders" && (
          <Card className="border-0 shadow-lg shadow-slate-100">
            <CardHeader className="pb-2">
              <CardTitle>Order Queue</CardTitle>
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
                  <div className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {showCanceledOrders ? "all" : "active"} orders ({visibleOrders.length})
                    </div>
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      onClick={() => setShowCanceledOrders((prev) => !prev)}
                    >
                      {showCanceledOrders ? "Hide" : "Show"} canceled orders
                    </button>
                  </div>

                  {visibleOrders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No active orders. Turn on canceled orders to review them.
                    </div>
                  ) : (
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
                          {visibleOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                                {order.orderCode || order._id}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {isFinalOrderStatus(order.status) ? (
                                  <Badge variant="secondary" className="capitalize">
                                    {ORDER_STATUS_LABEL[order.status] || order.status}
                                  </Badge>
                                ) : (
                                  <select
                                    value={order.status}
                                    onChange={(event) => handleStatusUpdate(order._id, event.target.value)}
                                    disabled={updatingOrderId === order._id}
                                    className="min-w-37.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {getOrderStatusOptions().map((key) => (
                                      <option key={key} value={key}>
                                        {ORDER_STATUS_LABEL[key] || key}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </td>
                              <td className="max-w-55 truncate px-4 py-3 text-sm text-slate-600">
                                {order.address || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {order.products?.reduce((sum, item) => sum + item.count, 0) || 0}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "inventory" && (
          <Card className="border-0 shadow-lg shadow-slate-100">
            <CardHeader className="pb-2">
              <CardTitle>Inventory Management</CardTitle>
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
                        <th className="w-32 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Available Stock
                        </th>
                        <th className="w-24 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Sold
                        </th>
                        {canEditInventory && (
                          <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{product.title}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">{product.sold}</td>
                          {canEditInventory && (
                            <td className="px-4 py-3 text-right text-sm">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditProductDialog(product)}
                                >
                                  Edit stock
                                </Button>
                                {canDeleteInventory && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => openDeleteProductDialog(product)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          )}
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

        {activeTab === "chat" && (
          <div className="mt-4">
            <StaffChatDashboard user={user} isEmbedded />
          </div>
        )}

        <Dialog open={Boolean(editingInventoryProduct)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stock</DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleEditProductQuantity();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="inventory-quantity">New stock quantity</Label>
                <Input
                  id="inventory-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={stockInputValue}
                  onChange={(event) => setStockInputValue(event.target.value)}
                  disabled={stockDialogSubmitting}
                />
                <p className="text-sm text-muted-foreground">
                  {editingInventoryProduct?.title || "Selected product"}
                </p>
                {stockDialogError && (
                  <p className="text-sm text-red-600">{stockDialogError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditProductDialog}
                  disabled={stockDialogSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={stockDialogSubmitting}>
                  {stockDialogSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={Boolean(deletingInventoryProduct)}
          title="Delete Product"
          description={
            deletingInventoryProduct
              ? `Delete "${deletingInventoryProduct.title}" permanently?`
              : "Delete this product permanently?"
          }
          confirmText={deleteDialogSubmitting ? "Deleting..." : "Delete"}
          confirmDisabled={deleteDialogSubmitting}
          cancelDisabled={deleteDialogSubmitting}
          onConfirm={handleDeleteProduct}
          onCancel={closeDeleteProductDialog}
        />
      </div>
    </div>
  );
}
