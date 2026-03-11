import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import type { Category, Product } from "@/types/product";
import { getProducts, getCategories } from "@/services/productService";

interface ProductListPageProps {
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogoutClick?: () => void;
}

export function ProductListPage({
  isLoggedIn = false,
  user,
  onLogoutClick,
}: ProductListPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // simple placeholder if you later want to show add-to-cart messages
  const [addedMessage] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");
  const categoryId = searchParams.get("categoryId") || "";
  const search = searchParams.get("search") || "";

  const [searchDraft, setSearchDraft] = useState(search);

  const pagination = useMemo(() => {
    return {
      page,
      limit,
    };
  }, [page, limit]);

  const handleNavigate = (pageKey: string) => {
    if (pageKey === "home") navigate("/");
    else if (pageKey === "products") navigate("/products");
    else if (pageKey === "profile") navigate("/profile");
    else navigate("/");
  };

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCategories();
        const raw = (
          Array.isArray(res) ? res : (res as { data?: unknown }).data || []
        ) as Array<{
          _id?: string;
          id?: string;
          name?: string;
          title?: string;
        }>;
        const cats: Category[] = raw.map((c) => ({
          _id: c._id || c.id || "",
          id: c._id || c.id || "",
          name: c.name || c.title || "",
        }));
        // Ẩn category "Bỉm" khỏi UI (vẫn giữ trong DB)
        const visibleCats = cats.filter((c) => c._id && c.name !== "Bỉm");
        if (mounted) setCategories(visibleCats);
      } catch {
        if (mounted) setCategories([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getProducts({
          page: pagination.page,
          limit: pagination.limit,
          categoryId: categoryId || undefined,
        });

        const raw = (
          Array.isArray(res) ? res : (res as { data?: unknown }).data || []
        ) as Array<{
          _id?: string;
          id?: string;
          title?: string;
          name?: string;
          description?: string;
          brand?: string;
          price?: number | string;
          images?: string[] | null;
        }>;

        let items: Product[] = raw.map((p) => ({
          _id: p._id || p.id || "",
          id: p._id || p.id,
          title: p.title,
          name: p.title || p.name || "",
          description: p.description || "",
          brand: p.brand || "",
          price: Number(p.price) || 0,
          images: p.images || [],
          image: Array.isArray(p.images) && p.images.length ? p.images[0] : "",
        }));

        // Search theo tên product ở client để tránh lỗi 422 từ server
        if (search) {
          const keyword = search.toLowerCase();
          items = items.filter((p) =>
            (p.title || p.name || "").toLowerCase().includes(keyword)
          );
        }

        if (mounted) setProducts(items.length ? items : []);
      } catch (e) {
        if (mounted) {
          setError("Failed to load products. Please try again.");
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pagination.page, pagination.limit, categoryId, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <Header
        cartItemCount={0}
        onCartClick={() => navigate("/cart")}
        onLoginClick={() => navigate("/login")}
        onRegisterClick={() => navigate("/register")}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={handleNavigate}
        onLogout={onLogoutClick}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Browse products from MomCare Store
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex gap-2 w-full">
              <select
                value={categoryId}
                onChange={(e) => setParam("categoryId", e.target.value)}
                className="h-10 w-40 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search products..."
                className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const trimmed = searchDraft.trim();
                  const next = new URLSearchParams(searchParams);
                  if (trimmed) {
                    next.set("search", trimmed);
                    // search theo tên product, không giới hạn category
                    next.delete("categoryId");
                  } else {
                    next.delete("search");
                  }
                  next.delete("page");
                  setSearchParams(next);
                }}
              >
                Search
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchDraft("");
                  const next = new URLSearchParams(searchParams);
                  next.delete("search");
                  next.delete("page");
                  setSearchParams(next);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {addedMessage && (
          <div className="mb-4 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {addedMessage}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-semibold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={categoryId ? "secondary" : "default"}
                    className="cursor-pointer"
                    onClick={() => setParam("categoryId", "")}
                  >
                    All
                  </Badge>
                  {categories.map((c) => (
                    <Badge
                      key={c._id}
                      variant={categoryId === c._id ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => setParam("categoryId", c._id)}
                    >
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-muted-foreground">
                Loading products...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Card
                    key={p._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-44 bg-gray-100">
                      <ImageWithFallback
                        src={
                          typeof p.image === "string" && p.image
                            ? p.image
                            : Array.isArray(p.images) && p.images.length
                              ? p.images[0]
                              : typeof p.images === "string" && p.images
                                ? p.images
                                : "https://placehold.co/600x400?text=MomCare"
                        }
                        alt={p.title || p.name || "Product image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4">
                      {p.brand && (
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1">
                          {p.brand}
                        </p>
                      )}
                      <h3 className="font-semibold mb-3 line-clamp-2">
                        {p.title || p.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          ${Number(p.price).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigate(`/products/${p._id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set("page", String(Math.max(1, page - 1)));
                  setSearchParams(next);
                }}
              >
                Prev
              </Button>
              <Badge variant="secondary">Page {page}</Badge>
              <Button
                variant="outline"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.set("page", String(page + 1));
                  setSearchParams(next);
                }}
              >
                Next
              </Button>
            </div>
          </main>
        </div>
      </div>

      <Footer setCurrentPage={handleNavigate} />
    </div>
  );
}
