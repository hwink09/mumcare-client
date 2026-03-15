import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getMyOrders } from "@/services/orderService";
import { getProductById, addRating } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

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

function OrderProductItem({ item, isDelivered, userId }: { item: { productId: string; count: number }; isDelivered: boolean; userId?: string }) {
  const [product, setProduct] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    getProductById(item.productId)
      .then((res) => {
        if (mounted) setProduct(res.data || res);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [item.productId]);

  const handleReview = async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    try {
      await addRating(product._id || product.id, { star, comment: comment.trim() || undefined });
      setSubmitted(true);
      setShowReview(false);
    } catch {
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return <div className="text-xs text-muted-foreground py-2">Loading item {item.productId}...</div>;

  const img =
    typeof product.image === "string" && product.image
      ? product.image
      : Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : typeof product.images === "string" && product.images
          ? product.images
          : "https://placehold.co/100x100?text=MomCare";

  const hasReviewed = product.ratings?.some((r: any) => r.postedBy === userId);
  const canReview = isDelivered && !submitted && !hasReviewed;
  const showReviewedBadge = submitted || hasReviewed;

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0 border-slate-100">
      <ImageWithFallback src={img} alt="Product" className="w-14 h-14 object-cover rounded-md border" />
      <div className="flex-1">
        <div className="font-medium text-sm text-slate-900">{product.title || product.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">x{item.count}</div>
      </div>
      <div>
        <div className="text-sm font-semibold text-right mb-1">${Number(product.price * item.count).toFixed(2)}</div>
        {canReview && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowReview(true)}>Review</Button>
        )}
        {showReviewedBadge && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-normal">Reviewed</Badge>}
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg">
               <img src={img} alt="Product" className="w-12 h-12 object-cover rounded border bg-white" />
               <div className="text-sm font-medium">{product.title || product.name}</div>
            </div>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setStar(s)} className="p-1 transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${s <= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-md p-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="How was the product? (Optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowReview(false)}>Cancel</Button>
              <Button onClick={handleReview} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getMyOrders();
        const items = (Array.isArray(res) ? res : (res as { data?: unknown }).data || []) as OrderItem[];
        if (mounted) setOrders(items.length ? items : []);
      } catch {
        if (mounted) {
          setError("Failed to load orders. Please try again.");
          setOrders([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track your purchase and loyalty-eligible deliveries</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
        </div>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium mb-2">No orders yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first order from checkout.</p>
              <Button onClick={() => navigate("/products")}>Shop now</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{order.orderCode || `Order ${order._id.slice(-6).toUpperCase()}`}</span>
                    <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground bg-slate-50 p-3 rounded-md">
                    <div><span className="font-medium">Address:</span> {order.address || "-"}</div>
                    <div><span className="font-medium">Date:</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</div>
                    <div><span className="font-medium">Voucher:</span> {order.couponCode || "None"}</div>
                    <div><span className="font-medium">Discount:</span> ${Number(order.discountAmount || 0).toFixed(2)}</div>
                  </div>
                  
                  <div className="border rounded-md px-3">
                    {order.products?.map((item, idx) => (
                      <OrderProductItem 
                        key={`${item.productId}-${idx}`} 
                        item={item} 
                        isDelivered={order.status === "delivered"}
                        userId={user?._id || user?.id}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
