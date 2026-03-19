import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquareText, ShoppingBag, Star } from "lucide-react";
import type { CurrentUser } from "@/hooks/useAuth";
import { normalizeImageList } from "@/lib/image";
import { getProducts } from "@/services/productService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

type ReviewEntry = {
  id: string;
  productId: string;
  productName: string;
  image: string;
  star: number;
  comment: string;
  createdAt?: string;
};

const formatReviewDate = (value?: string) => {
  if (!value) return "Date unavailable";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function MyReviewsPage({ user, isLoggedIn }: { user?: CurrentUser; isLoggedIn: boolean }) {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + Number(review.star || 0), 0) / reviews.length;
  }, [reviews]);

  const commentCount = useMemo(
    () => reviews.filter((review) => review.comment.trim().length > 0).length,
    [reviews],
  );

  const latestReviewDate = reviews[0]?.createdAt ? formatReviewDate(reviews[0].createdAt) : "No reviews yet";

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login");
      return;
    }

    let mounted = true;
    setLoading(true);

    const fetchMyReviews = async () => {
      try {
        const userId = user._id || user.id;
        let allProducts: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages && currentPage <= 10) {
          const res = await getProducts({ limit: 100, page: currentPage });
          const products = Array.isArray((res as { data?: unknown[] })?.data)
            ? (res as { data?: unknown[] }).data || []
            : Array.isArray(res) ? res : [];

          if (Array.isArray(products)) {
            allProducts = [...allProducts, ...products];
          }

          const pagination = !Array.isArray(res) && typeof res === "object"
            ? (res as { pagination?: { totalPages?: number } }).pagination
            : null;

          if (pagination?.totalPages) {
            totalPages = pagination.totalPages;
          } else {
            break;
          }

          currentPage += 1;
        }

        const myReviews: ReviewEntry[] = [];

        allProducts.forEach((product: any) => {
          if (Array.isArray(product.ratings)) {
            product.ratings.forEach((review: any) => {
              const postedById =
                typeof review.postedBy === "string"
                  ? review.postedBy
                  : review.postedBy?._id || review.postedBy?.id;

              if (postedById === userId) {
                const [image = ""] = normalizeImageList(product.image || product.images);

                myReviews.push({
                  id: `${product._id || product.id}-${review._id || review.createdAt || Math.random().toString(36).slice(2)}`,
                  productId: product._id || product.id,
                  productName: product.title || product.name || "Unnamed product",
                  image,
                  star: Number(review.star || 0),
                  comment: review.comment || "",
                  createdAt: review.createdAt,
                });
              }
            });
          }
        });

        myReviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (mounted) {
          setReviews(myReviews);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError("Failed to load your reviews.");
          setLoading(false);
        }
      }
    };

    void fetchMyReviews();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_24%,rgba(239,246,255,0.88)_100%)]">
        <div className="text-slate-500">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_24%,rgba(239,246,255,0.88)_100%)]">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm hover:bg-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Review History</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">My Reviews</h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-slate-600">
              Every delivered-order rating you leave appears here, so you can quickly revisit your feedback and open
              the product again when needed.
            </p>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <MessageSquareText className="h-8 w-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-black text-slate-900">No reviews yet</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      Delivered products can be reviewed from your order details. Once you submit one, it will appear here.
                    </p>
                    <Button
                      onClick={() => navigate("/orders")}
                      className="mt-6 h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                    >
                      Go to My Orders
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]"
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => navigate(`/products/${review.productId}`)}
                          className="h-28 w-full shrink-0 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 sm:w-32"
                        >
                          <ImageWithFallback
                            src={review.image}
                            alt={review.productName}
                            className="h-full w-full object-cover"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Reviewed product
                              </p>
                              <button
                                type="button"
                                onClick={() => navigate(`/products/${review.productId}`)}
                                className="mt-2 text-left text-2xl font-black leading-tight text-slate-950 transition-colors hover:text-pink-600"
                              >
                                {review.productName}
                              </button>

                              <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <Star
                                      key={value}
                                      className={`h-4 w-4 ${
                                        value <= review.star ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                                  {review.star}/5 stars
                                </span>
                              </div>
                            </div>

                            <div className="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-3 text-left lg:min-w-[180px] lg:text-right">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Submitted
                              </p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">
                                {formatReviewDate(review.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Your comment
                            </p>
                            <p className="mt-2 text-sm leading-7 text-slate-700">
                              {review.comment.trim() || "No written comment for this review."}
                            </p>
                          </div>

                          <div className="mt-5 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => navigate(`/products/${review.productId}`)}
                              className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                            >
                              View product
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Your review snapshot</h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MessageSquareText className="h-4 w-4" />
                      <span className="text-sm font-medium">Total reviews</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">{reviews.length}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">Average rating</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">
                      {reviews.length ? averageRating.toFixed(1) : "0.0"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-sm font-medium">With comment</span>
                    </div>
                    <p className="mt-3 text-3xl font-black text-slate-950">{commentCount}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[24px] border border-sky-100 bg-sky-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Latest activity</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{latestReviewDate}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Order Reminder</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">Need to review another order?</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Open a delivered order to rate the products you received. That keeps product detail reviews and your
                  personal history in sync.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/orders")}
                  className="mt-5 h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  Open My Orders
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
