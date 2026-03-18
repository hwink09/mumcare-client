import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "@/services/productService";
import type { Product } from "@/types/product";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { formatVND } from "@/lib/currency";
import { Star } from "lucide-react";

// ui components
import { Button } from "@/components/ui/button";

interface ProductDetailPageProps {
  onAddToCart?: (product: Product) => boolean | void;
  onGoToCart?: () => void;
}

type ProductRating = NonNullable<Product["ratings"]>[number];

const getReviewerLabel = (postedBy: unknown) => {
  if (postedBy && typeof postedBy === "object") {
    const user = postedBy as {
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
    };

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (user.name?.trim()) return user.name.trim();
    if (user.email?.trim()) return user.email.trim().split("@")[0];
  }

  return "Verified customer";
};

const formatReviewDate = (createdAt?: string) => {
  if (!createdAt) return "Unknown date";

  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function ProductDetailPage({ onAddToCart, onGoToCart }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addedMessage, setAddedMessage] = useState<string | null>(null);

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
          setError("Failed to load product. Please try again.");
          setProduct(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const mainImage = useMemo(() => {
    const img = product?.image;
    const imgs = product?.images;

    if (typeof img === "string" && img) return img;
    if (Array.isArray(imgs) && imgs.length) return imgs[0];
    if (typeof imgs === "string" && imgs) return imgs;

    return "https://placehold.co/800x500?text=MumCare";
  }, [product]);

  const reviews = useMemo(() => {
    const list = Array.isArray(product?.ratings) ? [...product.ratings] : [];
    return list.sort((a, b) => {
      const first = new Date(b.createdAt || 0).getTime();
      const second = new Date(a.createdAt || 0).getTime();
      return first - second;
    });
  }, [product?.ratings]);

  const reviewCount = product?.ratingCount ?? reviews.length;
  const averageRating = useMemo(() => {
    if (typeof product?.avgRating === "number" && product.avgRating > 0) {
      return product.avgRating;
    }

    if (!reviews.length) return 0;

    const totalStars = reviews.reduce((sum, review) => sum + (Number(review.star) || 0), 0);
    return totalStars / reviews.length;
  }, [product?.avgRating, reviews]);

  const handleAddToCartClick = () => {
    if (!product) return;
    const didAdd = onAddToCart?.(product);
    if (didAdd === false) return;
    setAddedMessage("Added to cart");
    setTimeout(() => setAddedMessage(null), 2000);
  };


  if (loading) return <div className="py-20 text-center">Loading product...</div>;

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/products")}>
            Back to products
          </Button>
        </div>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
        {addedMessage && <div className="mb-4 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">{addedMessage}</div>}

        {!product ? (
          <div className="text-center text-muted-foreground">Product not found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex items-center justify-center rounded-lg border bg-slate-50 p-3 min-h-100 lg:min-h-140">
                <ImageWithFallback
                  src={mainImage}
                  alt={product.title || product.name || "Product image"}
                  className="max-h-135 w-full max-w-[92%] object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.title || product.name}</h1>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl font-bold text-primary">{formatVND(Number(product.price || 0))}</div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{averageRating > 0 ? averageRating.toFixed(1) : "No rating"}</span>
                    <span className="text-amber-600/80">({reviewCount})</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-6">Brand: {product.brand || "MumCare"}</div>

                <div className="flex gap-3">
                  <Button onClick={handleAddToCartClick}>Add to cart</Button>
                  <Button variant="outline" onClick={() => (onGoToCart ? onGoToCart() : navigate("/cart"))}>Go to cart</Button>
                </div>
              </div>
            </div>

            <section className="mt-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All reviews for this product are shown here. New reviews can only be submitted after a delivered order in My Orders.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{averageRating > 0 ? averageRating.toFixed(1) : "No rating yet"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-muted-foreground">
                  This product has no reviews yet. Customers will be able to review it after their order is delivered.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {reviews.map((review: ProductRating, index) => {
                    const reviewStars = Math.max(0, Math.min(5, Number(review.star) || 0));

                    return (
                      <article
                        key={`${String(review.postedBy)}-${review.createdAt}-${index}`}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{getReviewerLabel(review.postedBy)}</div>
                            <div className="mt-1 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= reviewStars ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatReviewDate(review.createdAt)}
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {review.comment?.trim() || "This customer left a rating without a written comment."}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
