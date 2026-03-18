import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Package2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { formatVND } from "@/lib/currency";
import { extractImageUrl, normalizeImageList } from "@/lib/image";
import { resolvePageRoute } from "@/lib/pageRoutes";
import { getCategories, getProductsWithPagination } from "@/services/productService";
import type { Category, Product } from "@/types/product";

interface ProductListPageProps {
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogoutClick?: () => void;
  cartItemCount?: number;
  onAddToCart?: (product: Product) => boolean | void;
  onCartClick?: () => void;
}

const getProductImage = (product: Product) => {
  const images = normalizeImageList(product.images);
  return extractImageUrl(product.image) || images[0] || "https://placehold.co/600x400?text=MumCare";
};

const normalizeCategoryName = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function ProductListPage({
  isLoggedIn = false,
  user,
  onLogoutClick,
  cartItemCount = 0,
  onAddToCart,
  onCartClick,
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
  const categoryRailRef = useRef<HTMLDivElement | null>(null);

  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const limit = Number(searchParams.get("limit") || "12");
  const categoryId = searchParams.get("categoryId") || "";
  const search = searchParams.get("search") || "";

  const pagination = useMemo(
    () => ({
      page,
      limit,
    }),
    [page, limit],
  );

  const activeCategory = useMemo(
    () => categories.find((category) => category._id === categoryId) || null,
    [categories, categoryId],
  );

  const handleNavigate = (pageKey: string) => {
    navigate(resolvePageRoute(pageKey));
  };

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  };

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("search");
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

        const visibleCategories: Category[] = raw
          .map((category) => ({
            _id: category._id || category.id || "",
            id: category._id || category.id || "",
            name: category.name || category.title || "",
          }))
          .filter((category) => category._id && normalizeCategoryName(category.name) !== "bim");

        if (mounted) setCategories(visibleCategories);
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

        let items: Product[] = raw.map((product) => ({
          _id: product._id || product.id || "",
          id: product._id || product.id,
          title: product.title,
          name: product.title || product.name || "",
          description: product.description || "",
          brand: product.brand || "",
          price: Number(product.price) || 0,
          images: product.images || [],
          image: Array.isArray(product.images) && product.images.length ? product.images[0] : "",
        }));

        if (search) {
          const keyword = search.toLowerCase();
          items = items.filter((product) =>
            (product.title || product.name || "").toLowerCase().includes(keyword),
          );
        }

        const rawPagination = res.pagination || {};
        const parsedTotalItems = Number(
          rawPagination.totalItems ?? rawPagination.total ?? items.length ?? 0,
        );
        const safeLimit = Math.max(1, pagination.limit || 1);
        const fallbackTotalPages = Math.ceil(parsedTotalItems / safeLimit);
        const parsedTotalPages = Number(
          rawPagination.totalPages ?? fallbackTotalPages ?? 1,
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
      } catch (fetchError) {
        if (mounted) {
          setError("Failed to load products. Please try again.");
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
          console.error(fetchError);
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
    setCanSlideRight(hasOverflow && rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
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

  const visibleProductCount = products.length;

  const summaryText = loading
    ? "Loading products..."
    : visibleProductCount > 0
      ? `${visibleProductCount} products currently visible`
      : "No products match the current filters";

  const toTwoLinePreview = (value: string, maxChars = 92) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, maxChars).trimEnd()}...`;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,248,250,1),rgba(255,255,255,0.96),rgba(239,246,255,0.92))]">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={onCartClick || (() => navigate("/cart"))}
        onLoginClick={() => navigate("/login")}
        onRegisterClick={() => navigate("/register")}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={handleNavigate}
        onLogout={onLogoutClick}
      />

      <main className="container mx-auto px-4 pb-10 pt-8">
        <section className="rounded-[30px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                  Filter by category
                </p>
                <p className="mt-1 text-sm text-slate-500">{summaryText}</p>
              </div>

              {search ? (
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                  Clear search
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {hasCategoryOverflow ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => slideCategories("left")}
                  disabled={!canSlideLeft}
                  className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-white shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : null}

              <div ref={categoryRailRef} className="flex-1 overflow-x-auto scroll-smooth">
                <div className="inline-flex min-w-max gap-2 pr-1">
                  <Badge
                    variant={categoryId ? "secondary" : "default"}
                    className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold"
                    onClick={() => setParam("categoryId", "")}
                  >
                    All products
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category._id}
                      variant={categoryId === category._id ? "default" : "secondary"}
                      className="cursor-pointer rounded-full px-4 py-2.5 text-sm font-semibold"
                      onClick={() => setParam("categoryId", category._id)}
                    >
                      {category.name}
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
                  className="h-11 w-11 shrink-0 rounded-full border border-slate-200 bg-white shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            {search ? (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-700">
                Showing products filtered by <span className="font-semibold">{`"${search}"`}</span>. Category chips will continue refining these results.
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-[30px] border border-slate-200/80 bg-white/80 py-24 text-center text-muted-foreground shadow-sm">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200/80 bg-white/85 p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 shadow-sm">
                <Package2 className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-900">No matching products found</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                Try switching to another category or clear the current search to explore the full MumCare collection.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {categoryId ? (
                  <Button
                    variant="outline"
                    className="rounded-full bg-white"
                    onClick={() => setParam("categoryId", "")}
                  >
                    Show all categories
                  </Button>
                ) : null}
                {search ? (
                  <Button
                    className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                    onClick={clearSearch}
                  >
                    Clear search
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product, index) => {
                const label =
                  product.tags?.[0] ||
                  (activeCategory?.name ? `${activeCategory.name} pick` : index === 0 ? "Best Seller" : "Featured");

                return (
                  <Card
                    key={product._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/products/${product._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/products/${product._id}`);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_38px_88px_-50px_rgba(15,23,42,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.92))] p-5">
                      <div className="absolute left-4 top-4 z-10">
                        <Badge className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                          {label}
                        </Badge>
                      </div>
                      <ImageWithFallback
                        src={getProductImage(product)}
                        alt={product.title || product.name || "Product image"}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <CardContent className="flex grow flex-col p-5">
                      {product.brand && (
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {product.brand}
                        </p>
                      )}
                      <h3 className="line-clamp-2 text-lg font-black text-slate-900">
                        {product.title || product.name}
                      </h3>
                      <p className="mt-3 grow text-sm leading-7 text-slate-500">
                        {toTwoLinePreview(product.description || "Premium product from MumCare.")}
                      </p>

                      <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Price</p>
                          <p className="mt-1 text-2xl font-black text-pink-600">
                            {formatVND(Number(product.price))}
                          </p>
                        </div>
                        <div
                          className="flex shrink-0 items-center gap-1.5 self-end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            className="h-8 rounded-full bg-white px-3 text-[12px] font-semibold"
                            onClick={() => {
                              onAddToCart?.(product);
                            }}
                          >
                            Add to cart
                          </Button>
                          <Button
                            className="h-8 rounded-full bg-slate-900 px-3 text-[12px] font-semibold text-white hover:bg-slate-800"
                            onClick={() => navigate(`/products/${product._id}`)}
                          >
                            View details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-full bg-white px-5"
              disabled={page <= 1 || loading}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(Math.max(1, page - 1)));
                setSearchParams(next);
              }}
            >
              Prev
            </Button>
            <Badge variant="secondary" className="rounded-full px-4 py-2 text-sm">
              Page {Math.min(page, totalPages)} / {totalPages}
            </Badge>
            <Button
              variant="outline"
              className="rounded-full bg-white px-5"
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
        </section>
      </main>

      <Footer setCurrentPage={handleNavigate} />
    </div>
  );
}
