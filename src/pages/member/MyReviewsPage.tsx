import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getProducts } from "@/services/productService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

export function MyReviewsPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
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

        // Backend limits to 100 per page, so paginate up to 10 pages
        while (currentPage <= totalPages && currentPage <= 10) {
          const res = await getProducts({ limit: 100, page: currentPage });
          const products = res.data?.products || res.products || (Array.isArray(res) ? res : []);
          
          if (Array.isArray(products)) {
            allProducts = [...allProducts, ...products];
          }

          const pagination = res.data?.pagination || res.pagination;
          if (pagination && pagination.totalPages) {
            totalPages = pagination.totalPages;
          } else {
            break;
          }
          currentPage++;
        }
        
        const myReviews: any[] = [];
        
        allProducts.forEach((product: any) => {
          if (product.ratings && Array.isArray(product.ratings)) {
            product.ratings.forEach((r: any) => {
              if (r.postedBy === userId) {
                myReviews.push({
                  product,
                  review: r
                });
              }
            });
          }
        });

        myReviews.sort((a, b) => new Date(b.review.createdAt).getTime() - new Date(a.review.createdAt).getTime());

        if (mounted) {
          setReviews(myReviews);
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

    fetchMyReviews();

    return () => {
      mounted = false;
    };
  }, [authLoading, isLoggedIn, user, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Reviews</h1>
            <p className="text-muted-foreground mt-1">Review history of products you purchased</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Back Home</Button>
        </div>

        {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">You haven&apos;t reviewed any products yet.</p>
              <p className="text-muted-foreground mb-6">Purchase products and leave your thoughts after delivery!</p>
              <Button onClick={() => navigate("/orders")}>Go to My Orders</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((item, idx) => {
              const p = item.product;
              const r = item.review;
              const img =
                typeof p.image === "string" && p.image
                  ? p.image
                  : Array.isArray(p.images) && p.images.length > 0
                    ? p.images[0]
                    : typeof p.images === "string" && p.images
                      ? p.images
                      : "https://placehold.co/100x100?text=MomCare";
              
              return (
                <Card key={idx} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-32 h-32 bg-gray-100 shrink-0 cursor-pointer" onClick={() => navigate(`/products/${p._id || p.id}`)}>
                      <ImageWithFallback src={img} alt={p.title || p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <h3 
                          className="font-semibold text-lg cursor-pointer hover:underline text-slate-800"
                          onClick={() => navigate(`/products/${p._id || p.id}`)}
                        >
                          {p.title || p.name}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= r.star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-md border text-sm text-slate-700">
                        {r.comment ? (
                          <p>{r.comment}</p>
                        ) : (
                          <p className="italic text-muted-foreground">No written comment</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
