import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category, Product } from "@/types/product";
import { getProductsWithPagination, getCategories } from "@/services/productService";
import { resolvePageRoute } from "@/lib/pageRoutes";
import { formatVND } from "@/lib/currency";

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
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasCategoryOverflow, setHasCategoryOverflow] = useState(false);
  const [canSlideLeft, setCanSlideLeft] = useState(false);
  const [canSlideRight, setCanSlideRight] = useState(false);
  // simple placeholder if you later want to show add-to-cart messages
  const [addedMessage] = useState<string | null>(null);
  const categoryRailRef = useRef<HTMLDivElement | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Number(searchParams.get("limit") || "12");
  const categoryId = searchParams.get("categoryId") || "";
  const search = searchParams.get("search") || "";

  const [searchDraft, setSearchDraft] = useState(search);

  const toTwoLinePreview = (value: string, maxChars = 88) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, maxChars).trimEnd()}...`;
  };

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
    else if (pageKey === "orders") navigate("/orders");
    else if (pageKey === "reviews") navigate("/reviews");
    else if (pageKey === "loyalty") navigate("/loyalty");
    else if (pageKey === "blogs") navigate("/blogs");
    else if (pageKey === "cart") navigate("/cart");
    else if (pageKey === "contact") navigate("/contact");
    else if (pageKey === "about") navigate("/about");
    else if (pageKey === "staff-login") navigate("/staff/login");
    else if (pageKey === "admin_dashboard") navigate("/admin/dashboard");
    else if (pageKey === "admin_blogs") navigate("/admin/blogs");
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
        // áº¨n category "Bá»‰m" khá»i UI (váº«n giá»¯ trong DB)
        const visibleCats = cats.filter((c) => c._id && c.name !== "Bá»‰m");
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
        const res = await getProductsWithPagination({
          page: pagination.page,
          limit: pagination.limit,
          categoryId: categoryId || undefined,
        });

        const raw = (res.data || []) as Array<{
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

        // Search theo tÃªn product á»Ÿ client Ä‘á»ƒ trÃ¡nh lá»—i 422 tá»« server
        if (search) {
          const keyword = search.toLowerCase();
          items = items.filter((p) =>
            (p.title || p.name || "").toLowerCase().includes(keyword)
          );
        }

        const rawPagination = res.pagination || {};
        const parsedTotalItems = Number(
          rawPagination.totalItems ?? rawPagination.total ?? items.length ?? 0
        );
        const safeLimit = Math.max(1, pagination.limit || 1);
        const fallbackTotalPages = Math.ceil(parsedTotalItems / safeLimit);
        const parsedTotalPages = Number(
          rawPagination.totalPages ?? fallbackTotalPages ?? 1
        );
        const normalizedTotalPages = Math.max(parsedTotalPages || 1, 1);

        if (mounted) {
          setProducts(items.length ? items : []);
          setTotalItems(parsedTotalItems);
          setTotalPages(normalizedTotalPages);

          if (page > normalizedTotalPages) {
            const next = new URLSearchParams(searchParams);
            next.set("page", String(normalizedTotalPages));
            setSearchParams(next);
          }
        }
      } catch (error) {
        if (mounted) {
          setError("Failed to load products. Please try again.");
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
          console.log(error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pagination.page, pagination.limit, categoryId, search]);

  const syncCategoryRailArrows = () => {
    const rail = categoryRailRef.current;
    if (!rail) {
      setHasCategoryOverflow(false);
      setCanSlideLeft(false);
      setCanSlideRight(false);
      return;
    }

    const hasOverflow = rail.scrollWidth > rail.clientWidth + 2;
    setHasCategoryOverflow(hasOverflow);
    setCanSlideLeft(hasOverflow && rail.scrollLeft > 2);
    setCanSlideRight(
      hasOverflow && rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2
    );
  };

  useEffect(() => {
    syncCategoryRailArrows();
    const rail = categoryRailRef.current;
    if (!rail) return;

    const handleScroll = () => syncCategoryRailArrows();

    rail.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      rail.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [categories]);

  const slideCategories = (direction: "left" | "right") => {
    const rail = categoryRailRef.current;
    if (!rail) return;

    const slideAmount = Math.max(rail.clientWidth * 0.65, 180);
    rail.scrollBy({
      left: direction === "right" ? slideAmount : -slideAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
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

      <div className="container mx-auto px-4 pb-4">
        <div className="flex flex-col gap-6">

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] xl:items-stretch xl:gap-4">
            <div className="flex min-h-[74px] w-full items-center gap-2">
              {hasCategoryOverflow ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => slideCategories("left")}
                  disabled={!canSlideLeft}
                  className="h-10 w-10 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : null}

              <div
                ref={categoryRailRef}
                className="flex-1 overflow-x-auto scroll-smooth"
              >
                <div className="inline-flex min-w-max gap-2 pr-1">
                  <Badge
                    variant={categoryId ? "secondary" : "default"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => setParam("categoryId", "")}
                  >
                    All
                  </Badge>
                  {categories.map((c) => (
                    <Badge
                      key={c._id}
                      variant={categoryId === c._id ? "default" : "secondary"}
                      className="cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => setParam("categoryId", c._id)}
                    >
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {hasCategoryOverflow ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => slideCategories("right")}
                  disabled={!canSlideRight}
                  className="h-10 w-10 shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            <div className="flex min-h-[74px] w-full items-center">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={searchDraft}
                  onChange={(e) => setSearchDraft(e.target.value)}
                  placeholder="Search products..."
                  className="h-10 flex-1 rounded-md border bg-background px-4 text-base"
                />
                <Button
                  variant="outline"
                  className="h-10 px-5"
                  onClick={() => {
                    const trimmed = searchDraft.trim();
                    const next = new URLSearchParams(searchParams);
                    if (trimmed) {
                      next.set("search", trimmed);
                      // Search by product name without forcing category filter.
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
                  className="h-10 border border-slate-200 bg-white px-4 hover:bg-slate-50"
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
        </div>

        {addedMessage && (
          <div className="mb-4 p-3 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            {addedMessage}
          </div>
        )}

        <div>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <Card
                  key={p._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    navigate(`/products/${p._id}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/products/${p._id}`);
                    }
                  }}
                  className="group cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 flex h-full select-none flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 p-3">
                    <ImageWithFallback
                      src={
                        typeof p.image === "string" && p.image
                          ? p.image
                          : Array.isArray(p.images) && p.images.length
                            ? p.images[0]
                            : typeof p.images === "string" && p.images
                              ? p.images
                          : "https://placehold.co/600x400?text=MumCare"
                      }
                      alt={p.title || p.name || "Product image"}
                      className="h-full w-full object-contain mix-blend-multiply transition-opacity duration-300"
                    />
                  </div>
                  <CardContent className="flex grow flex-col p-4">
                    {p.brand && (
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {p.brand}
                      </p>
                    )}
                    <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-800">
                      {p.title || p.name}
                    </h3>
                    <p className="mb-3 h-12 grow overflow-hidden text-sm leading-6 text-slate-500">
                      {toTwoLinePreview(
                        p.description || "Premium product from MumCare."
                      )}
                    </p>
                    <div className="mt-auto flex items-center border-t border-slate-100 pt-3">
                      <span className="text-lg font-extrabold text-pink-600">
                        {formatVND(Number(p.price))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.max(1, page - 1)));
                setSearchParams(next);
              }}
            >
              Prev
            </Button>
            <Badge variant="secondary">
              Page {Math.min(page, totalPages)} / {totalPages}
            </Badge>
            <Button
              variant="outline"
              disabled={loading || totalItems === 0 || page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.min(totalPages, page + 1)));
                setSearchParams(next);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Footer setCurrentPage={handleNavigate} />
    </div>
  );
}

