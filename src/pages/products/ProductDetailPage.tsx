import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { MOCK_PRODUCTS } from "@/constants/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addRating, getProductById } from "@/services/productService";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  isLoggedIn: boolean;
  onAddToCart?: (product: Product) => void;
}

export function ProductDetailPage({ isLoggedIn, onAddToCart }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [star, setStar] = useState(5);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getProductById(id);
        if (mounted) setProduct((res?.data || res) as Product);
      } catch {
        if (mounted) {
          setError("Đang hiển thị dữ liệu demo vì BE chưa sẵn sàng.");
          const mock = MOCK_PRODUCTS.find((p) => p._id === id || p.id === id) || null;
          setProduct(mock);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const mainImage = useMemo(() => product?.images?.[0] || product?.image || "https://placehold.co/800x500?text=MomCare", [product]);

  const handleRate = async () => {
    if (!id || !isLoggedIn) return;
    try {
      setRatingLoading(true);
      await addRating(id, { star, comment: comment.trim() || undefined });
      const refetch = await getProductById(id);
      setProduct((refetch?.data || refetch) as Product);
      setComment("");
    } catch {
      setError("Không gửi được rating do BE chưa sẵn sàng.");
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) return <div className="py-20 text-center">Loading product...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <Button variant="outline" onClick={() => navigate("/products")} className="mb-6">Back to products</Button>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        {!product ? (
          <div className="text-center text-muted-foreground">Product not found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden bg-gray-100 h-[340px]">
              <img src={mainImage} alt={product.title || product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title || product.name}</h1>
              <p className="text-muted-foreground mb-4">{product.description}</p>
              <div className="text-3xl font-bold text-primary mb-4">${Number(product.price || 0).toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mb-6">Brand: {product.brand || "MomCare"}</div>

              <div className="flex gap-3">
                <Button onClick={() => onAddToCart?.(product)}>Add to cart</Button>
                <Button variant="outline" onClick={() => navigate("/cart")}>Go to cart</Button>
              </div>
            </div>
          </div>
        )}

        {product && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Ratings & Feedback</h2>

              <div className="mb-4 text-sm text-muted-foreground">
                Avg rating: {Number(product.avgRating || 0).toFixed(1)} / 5 ({product.ratingCount || 0} reviews)
              </div>

              {isLoggedIn ? (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setStar(s)}>
                        <Star className={`h-5 w-5 ${s <= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full min-h-24 rounded-md border px-3 py-2 text-sm"
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button onClick={handleRate} disabled={ratingLoading}>{ratingLoading ? "Submitting..." : "Submit review"}</Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mb-4">Login to submit review.</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
