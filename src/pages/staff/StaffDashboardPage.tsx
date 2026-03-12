import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CurrentUser } from "@/hooks/useAuth";
import { getAllOrders, updateOrderStatus } from "@/services/orderService";
import { getProducts, updateProduct } from "@/services/productService";

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
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "support">("orders");

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showCanceledOrders, setShowCanceledOrders] = useState(false);

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState<string>("");

  const isStaff = useMemo(() => user?.role === "staff" || user?.role === "admin", [user]);

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
    } catch (error) {
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
    } catch (error) {
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


  const handleUpdateStock = async (productId: string, nextQty: number) => {
    try {
      await updateProduct(productId, { quantity: nextQty });
      await loadProducts();
    } catch (error) {
      console.error(error);
      setProductsError("Failed to update stock. Please try again.");
    }
  };

  const activeTabClasses = (tab: "orders" | "inventory" | "support") =>
    activeTab === tab
      ? "bg-primary text-white"
      : "bg-white text-foreground border border-gray-200 hover:bg-gray-50";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Staff Operations</h1>
            <p className="text-muted-foreground">Use this dashboard to manage orders, inventory and customer requests.</p>
          </div>

          <div className="w-full sm:w-72">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Name:</span>{' '}
                  {user?.firstName || 'Unknown'} {user?.lastName || ''}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Email:</span> {user?.email || 'Unknown'}
                </div>
                {user?.phone && (
                  <div className="text-sm">
                    <span className="font-semibold">Phone:</span> {user.phone}
                  </div>
                )}
                <div className="text-sm flex items-center gap-2">
                  <span className="font-semibold">Role:</span>
                  <Badge className="capitalize">{user?.role || 'unknown'}</Badge>
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

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Button className={activeTabClasses("orders")} onClick={() => setActiveTab("orders")}>Orders</Button>
          <Button className={activeTabClasses("inventory")} onClick={() => setActiveTab("inventory")}>Inventory</Button>
          <Button className={activeTabClasses("support")} onClick={() => setActiveTab("support")}>Support</Button>
        </div>

        <div className="space-y-4">
          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>Order queue</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading orders...</div>
                ) : ordersError ? (
                  <div className="py-12 text-center text-red-600">{ordersError}</div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No orders found.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm text-muted-foreground">
                        Showing {showCanceledOrders ? "all" : "active"} orders ({orders.length})
                      </div>
                      <button
                        type="button"
                        className="text-sm text-primary underline hover:text-primary/80"
                        onClick={() => setShowCanceledOrders((prev) => !prev)}
                      >
                        {showCanceledOrders ? "Hide" : "Show"} canceled orders
                      </button>
                    </div>

                    {(showCanceledOrders ? orders : orders.filter((o) => o.status !== "canceled")).map((order) => {
                      const next = getNextStatus(order.status);
                      return (
                        <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg bg-white">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="font-semibold">{order.orderCode || order._id}</span>
                              <Badge variant="secondary" className="capitalize">
                                {ORDER_STATUS_LABEL[order.status] || order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              <div>Address: {order.address || "-"}</div>
                              <div>Items: {order.products?.reduce((s, i) => s + i.count, 0) || 0}</div>
                              <div>Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {next && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusUpdate(order._id, next)}
                              >
                                Mark as {ORDER_STATUS_LABEL[next] || next}
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleCancelOrder(order._id)}>
                              Cancel
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => {
                              setSelectedOrderId(order._id)
                              setOrderNote("")
                            }}>
                              Add note
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "inventory" && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory management</CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="py-12 text-center text-muted-foreground">Loading inventory...</div>
                ) : productsError ? (
                  <div className="py-12 text-center text-red-600">{productsError}</div>
                ) : products.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">No products found.</div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg bg-white">
                        <div className="flex-1">
                          <div className="font-semibold">{product.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Current Stock: {product.quantity} • Sold: {product.sold}
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            min={0}
                            value={product.quantity}
                            onChange={(e) => {
                              const nextQty = Number(e.target.value);
                              setProducts((prev) =>
                                prev.map((p) => (p._id === product._id ? { ...p, quantity: nextQty } : p))
                              );
                            }}
                            className="w-24 border rounded px-3 py-2"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateStock(product._id, product.quantity)}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "support" && (
            <Card>
              <CardHeader>
                <CardTitle>Customer support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this tab to handle cancellations, refunds and customer issues.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-base">Refund / Cancel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Pick an order from the Orders tab and use the Cancel button to issue a refund.
                      </p>
                      <Button variant="outline" onClick={() => setActiveTab("orders")}>Go to Orders</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-base">Issue notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Select an order and add a note to track conversations or customer requests.
                      </p>
                      <textarea
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Add a quick note for the order..."
                        className="w-full border rounded px-3 py-2 h-28 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (!selectedOrderId) return;
                            alert("Note saved locally. Backend does not store notes yet.");
                          }}
                        >
                          Save Note
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrderId(null);
                            setOrderNote("");
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                      {selectedOrderId && (
                        <div className="text-xs text-muted-foreground">
                          Editing note for order <span className="font-semibold">{selectedOrderId}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
