import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getOrderById, getMyOrders } from "@/services/orderService";
import { getProductById, addRating } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, ArrowLeft, Package, MapPin, Calendar, Tag, Percent } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  canceled: "bg-red-100 text-red-700 border-red-200",
};

function ProductRow({ item, isDelivered, userId }: { item: { productId: string; count: number }; isDelivered: boolean; userId?: string }) {
  const [product, setProduct] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProductById(item.productId).then(res => { if (mounted) setProduct(res.data || res); }).catch(() => { });
    return () => { mounted = false; };
  }, [item.productId]);

  const handleReview = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await addRating(product._id || product.id, { star, comment: comment.trim() || undefined });
      setSubmitted(true);
      setShowReview(false);
    } catch { alert("Failed to submit review."); }
    finally { setSubmitting(false); }
  };

  if (!product) return <div className="text-xs text-muted-foreground py-3 border-b last:border-0">Loading...</div>;

  const img = typeof product.image === "string" && product.image ? product.image
    : Array.isArray(product.images) && product.images.length > 0 ? product.images[0]
      : typeof product.images === "string" && product.images ? product.images
        : "https://placehold.co/100x100?text=MomCare";

  const hasReviewed = product.ratings?.some((r: any) => r.postedBy === userId);
  const canReview = isDelivered && !submitted && !hasReviewed;
  const showReviewedBadge = submitted || hasReviewed;

  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0">
      <ImageWithFallback src={img} alt="Product" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 truncate">{product.title || product.name}</div>
        <div className="text-sm text-muted-foreground mt-0.5">Qty: {item.count}</div>
        <div className="text-sm font-medium text-slate-700 mt-0.5">${Number(product.price * item.count).toFixed(2)}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        {canReview && (
          <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => setShowReview(true)}>
            Leave Review
          </Button>
        )}
        {showReviewedBadge && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200">Reviewed</Badge>}
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Review: {product.title || product.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-1 py-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setStar(s)} className="p-1 transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${s <= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-200 outline-none resize-none"
              rows={4} placeholder="Share your experience... (optional)"
              value={comment} onChange={e => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReview(false)}>Cancel</Button>
              <Button onClick={handleReview} disabled={submitting} className="bg-amber-500 hover:bg-amber-600">
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    (async () => {
      try {
        // Try fetching by ID first, fall back to searching in my orders
        let found: any = null;
        try {
          const res = await getOrderById(orderId);
          found = res.data || res;
        } catch {
          // Fallback: search in my orders list
          const allRes = await getMyOrders();
          const all = Array.isArray(allRes) ? allRes : (allRes.data || []);
          found = all.find((o: any) => o._id === orderId);
        }
        setOrder(found || null);
        if (!found) setError("Order not found.");
      } catch {
        setError("Failed to load order.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-muted-foreground">Loading order details...</div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error || "Order not found."}</p>
        <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
      </div>
    </div>
  );

  const statusColor = STATUS_COLOR[order.status] || "bg-slate-100 text-slate-600";
  const isDelivered = order.status === "delivered";
  const hasDiscount = (order.discountAmount || 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {order.orderCode || `Order #${order._id?.slice(-6).toUpperCase()}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Order details and products</p>
          </div>
          <Badge className={`capitalize border px-3 py-1 text-sm font-medium ${statusColor}`}>
            {order.status}
          </Badge>
        </div>

        {/* Info Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Shipping Address</div>
                  <div className="font-medium text-slate-800">{order.address || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Order Date</div>
                  <div className="font-medium text-slate-800">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"}
                  </div>
                </div>
              </div>
              {order.couponCode && (
                <div className="flex items-start gap-2">
                  <Tag className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Voucher Applied</div>
                    <div className="font-mono font-semibold text-emerald-700">{order.couponCode}</div>
                  </div>
                </div>
              )}
              {hasDiscount && (
                <div className="flex items-start gap-2">
                  <Percent className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Discount Amount</div>
                    <div className="font-semibold text-orange-600">-${Number(order.discountAmount).toFixed(2)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {hasDiscount ? "Final Total (after discount)" : "Total Amount"}
                </span>
                <span className="text-xl font-bold text-slate-800">
                  ${Number(order.finalTotal ?? 0).toFixed(2)}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-emerald-600 font-medium">
                    You saved ${Number(order.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-700">
              Products ({order.products?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.products?.length > 0 ? (
              order.products.map((item: any, idx: number) => (
                <ProductRow
                  key={`${item.productId}-${idx}`}
                  item={item}
                  isDelivered={isDelivered}
                  userId={user?._id || user?.id}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">No products found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
