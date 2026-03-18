import {
  ArrowRight,
  Award,
  Baby,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { formatVND } from "@/lib/currency";
import { getProducts } from "@/services/productService";
import type { Product } from "@/types/product";

interface HomePageProps {
  featuredProducts?: Product[];
  onNavigate: (page: string) => void;
  onAddToCart: (product: Product) => boolean | void;
  cartItemCount?: number;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogoutClick?: () => void;
}

const promiseCards = [
  {
    icon: ShieldCheck,
    eyebrow: "Verified quality",
    title: "Every product is chosen with family-safe standards in mind.",
    description: "From formula and nursing support to travel gear, we only feature essentials we would confidently recommend.",
    iconClassName: "bg-emerald-50 text-emerald-600",
    panelClassName: "from-emerald-50/80 via-white to-white",
  },
  {
    icon: Truck,
    eyebrow: "Easy delivery",
    title: "Fast fulfillment for the things parents need right now.",
    description: "Clear shipping thresholds, dependable packaging, and a smoother journey from checkout to doorstep.",
    iconClassName: "bg-sky-50 text-sky-600",
    panelClassName: "from-sky-50/80 via-white to-white",
  },
  {
    icon: TrendingUp,
    eyebrow: "Practical guidance",
    title: "Shopping support paired with tips from the MumCare community.",
    description: "Helpful reads, popular picks, and member rewards come together so the store feels supportive, not overwhelming.",
    iconClassName: "bg-pink-50 text-pink-600",
    panelClassName: "from-pink-50/80 via-white to-white",
  },
];

const journeyCards = [
  {
    icon: Baby,
    title: "Everyday baby essentials",
    description: "Discover the staples families reorder most often, from diapers to feeding support.",
    buttonLabel: "Browse essentials",
    action: "products",
    accentClassName: "from-sky-500/10 via-white to-white",
    iconClassName: "bg-sky-50 text-sky-600",
  },
  {
    icon: Sparkles,
    title: "Comfort-first routines",
    description: "Explore gentle care ideas, product guides, and practical stories for daily parenting moments.",
    buttonLabel: "Read the blog",
    action: "blogs",
    accentClassName: "from-pink-500/10 via-white to-white",
    iconClassName: "bg-pink-50 text-pink-600",
  },
  {
    icon: Gift,
    title: "Rewards that feel useful",
    description: "Collect points from every order and turn them into vouchers you will actually want to use.",
    buttonLabel: "Open loyalty",
    action: "loyalty",
    accentClassName: "from-amber-400/12 via-white to-white",
    iconClassName: "bg-amber-50 text-amber-600",
  },
];

const heroStats = [
  { value: "10K+", label: "families trust MumCare" },
  { value: "500+", label: "carefully picked products" },
  { value: "4.9/5", label: "community satisfaction" },
  { value: "24/7", label: "support when needed" },
];

const getProductImage = (product: Product) => {
  if (typeof product.image === "string" && product.image) return product.image;
  if (Array.isArray(product.images) && product.images.length) return product.images[0];
  if (typeof product.images === "string" && product.images) return product.images;
  return "https://placehold.co/600x400?text=MumCare";
};

export function HomePage({
  featuredProducts,
  onNavigate,
  onAddToCart,
  cartItemCount = 0,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  onLogoutClick,
}: HomePageProps) {
  const navigate = useNavigate();
  const [localFeatured, setLocalFeatured] = useState<Product[]>(featuredProducts || []);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        if ((featuredProducts?.length || 0) === 0) {
          const resp: any = await getProducts({ page: 1, limit: 8 });
          const rawProducts = (Array.isArray(resp) ? resp : resp.data || []) as Array<{
            _id?: string;
            id?: string;
            title?: string;
            name?: string;
            description?: string;
            price?: number | string;
            images?: string[];
          }>;

          const mapped: Product[] = rawProducts.map((p) => ({
            _id: p._id || p.id || "",
            id: p._id || p.id || "",
            title: p.title,
            name: p.title || p.name || "",
            description: p.description || "",
            price: Number(p.price) || 0,
            images: p.images || [],
            image: Array.isArray(p.images) && p.images.length ? p.images[0] : "",
            tags: [],
          }));

          if (mounted) setLocalFeatured(mapped);
        } else if (featuredProducts && featuredProducts.length > 0) {
          setLocalFeatured(featuredProducts);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    void fetchData();

    return () => {
      mounted = false;
    };
  }, [featuredProducts]);

  const handleAddToCartClick = (product: Product) => {
    const didAdd = onAddToCart(product);
    if (didAdd === false) return;
    setAddedMessage(`Added "${product.name}" to cart`);
    setTimeout(() => setAddedMessage(null), 2000);
  };

  const handleRewardsClick = () => {
    if (isLoggedIn) {
      onNavigate("loyalty");
      return;
    }

    (onRegisterClick || onLoginClick || (() => {}))();
  };

  const showcaseProduct = localFeatured[0];
  const userGreeting = user?.firstName ? `${user.firstName}, here is` : "Here is";

  const toTwoLinePreview = (value: string, maxChars = 88) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxChars) return normalized;
    return `${normalized.slice(0, maxChars).trimEnd()}...`;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,248,250,1),rgba(255,255,255,0.96),rgba(239,246,255,0.92))]">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => onNavigate("cart")}
        onLoginClick={onLoginClick || (() => {})}
        onRegisterClick={onRegisterClick || (() => {})}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogoutClick}
      />

      {addedMessage && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100">
          {addedMessage}
        </div>
      )}

      <main className="flex-1">
        <section className="relative overflow-hidden pb-10 pt-8 md:pb-14 md:pt-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-8 h-56 w-56 rounded-full bg-pink-200/30 blur-3xl" />
            <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-amber-100/35 blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[34px] border border-white/70 bg-white/76 p-6 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur-sm md:p-8 lg:p-10">
                <Badge className="rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-4 py-1.5 text-sm text-white shadow-sm">
                  Trusted by 10,000+ families
                </Badge>

                <div className="mt-6 space-y-5">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
                    Thoughtful essentials, beautifully curated
                  </p>
                  <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                    Gentle care for every chapter of motherhood and baby life.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    {userGreeting} a calmer way to shop for formula, diapers, and daily care essentials. MumCare blends trusted products, practical guidance, and rewards that actually feel useful.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-7 text-white shadow-lg shadow-pink-200/60 hover:from-pink-600 hover:to-sky-600"
                    onClick={() => onNavigate("products")}
                  >
                    Shop the essentials
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white bg-white/85 px-7 text-slate-700 shadow-sm hover:bg-white"
                    onClick={() => onNavigate("blogs")}
                  >
                    Explore expert tips
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200/80 bg-white/82 px-4 py-4 shadow-sm"
                    >
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px]">
                <div className="relative min-h-[440px] overflow-hidden rounded-[36px] border border-white/70 bg-white/70 p-3 shadow-[0_35px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_45%)]" />
                  <div className="relative h-full overflow-hidden rounded-[30px]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1663028051021-07b4f67a6bd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHByZWduYW50JTIwd29tYW4lMjBzaG9wcGluZ3xlbnwxfHx8fDE3Njk2MDYzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="Mother and baby shopping essentials"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                    Curated for everyday care
                  </div>

                  <div className="absolute inset-x-6 bottom-6 rounded-[26px] border border-white/70 bg-white/88 p-4 shadow-lg backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          Daily picks from the community
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-900">
                          Practical favorites with a premium feel
                        </h3>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 shadow-sm">
                        <Baby className="h-5 w-5" />
                      </div>
                    </div>

                    {showcaseProduct ? (
                      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50/90 p-3">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
                          <ImageWithFallback
                            src={getProductImage(showcaseProduct)}
                            alt={showcaseProduct.name || "Featured product"}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                            {showcaseProduct.name || showcaseProduct.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">Featured today</p>
                        </div>
                        <div className="text-right text-base font-black text-pink-600">
                          {formatVND(Number(showcaseProduct.price || 0))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Truck className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fast fulfillment</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">
                      Ready for busy parents and last-minute essentials.
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Clear thresholds, smooth checkout, and products that feel easy to trust.
                    </p>
                  </div>

                  <div className="rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 p-5 text-white shadow-[0_28px_70px_-44px_rgba(15,23,42,0.8)]">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Community rating</p>
                    <div className="mt-4 flex items-center gap-1 text-amber-300">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="mt-3 text-5xl font-black">4.9</div>
                    <p className="mt-3 text-sm leading-6 text-white/75">
                      Parents keep coming back for the mix of reliability, guidance, and rewards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10">
          <div className="container mx-auto grid gap-4 px-4 lg:grid-cols-3">
            {promiseCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`rounded-[30px] border border-slate-200/80 bg-gradient-to-br ${item.panelClassName} p-6 shadow-sm`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-2 text-2xl font-black leading-tight text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Choose your starting point
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                  A softer, simpler way to explore the store.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-500 md:text-right">
                Jump into essentials, browse helpful content, or unlock benefits that make repeat shopping feel lighter.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {journeyCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`rounded-[30px] border border-slate-200/80 bg-gradient-to-br ${item.accentClassName} p-6 shadow-sm`}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-2xl font-black leading-tight text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-5 h-11 rounded-full bg-white/80 px-4 text-slate-700 shadow-sm hover:bg-white"
                      onClick={() => {
                        if (item.action === "loyalty") {
                          handleRewardsClick();
                          return;
                        }
                        onNavigate(item.action);
                      }}
                    >
                      {item.buttonLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                  Featured selection
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                  Community favorites, ready to shop.
                </h2>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-white bg-white/85 px-6 shadow-sm hover:bg-white"
                onClick={() => onNavigate("products")}
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {localFeatured.slice(0, 4).map((product, index) => {
                const productId = product.id || product._id;
                const productImage = getProductImage(product);
                const label = product.tags?.[0] || (index === 0 ? "Best Seller" : index === 1 ? "Popular Pick" : "Family Favorite");

                return (
                  <Card
                    key={productId || `featured-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (productId) navigate(`/products/${productId}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (productId) navigate(`/products/${productId}`);
                      }
                    }}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.38)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_38px_85px_-48px_rgba(15,23,42,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,rgba(248,250,252,1),rgba(241,245,249,0.9))] p-5">
                      <div className="absolute left-4 top-4 z-10">
                        <Badge className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
                          {label}
                        </Badge>
                      </div>
                      <ImageWithFallback
                        src={productImage}
                        alt={product.name ?? "Product"}
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
                        {product.name || product.title}
                      </h3>
                      <p className="mt-3 grow text-sm leading-7 text-slate-500">
                        {toTwoLinePreview(product.description || "Premium product from MumCare.")}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Price</p>
                          <p className="mt-1 text-2xl font-black text-pink-600">
                            {formatVND(Number(product.price))}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCartClick(product);
                          }}
                        >
                          Add to cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pb-16 pt-4">
          <div className="container mx-auto grid gap-4 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[32px] border border-slate-200/80 bg-white/82 p-7 shadow-sm">
              <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">MumCare Journal</Badge>
              <h2 className="mt-5 text-3xl font-black text-slate-900 md:text-4xl">
                Practical reads for feeding, comfort, and everyday parenting rhythm.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Explore short, helpful stories from our blog to make product choices feel more informed and less noisy.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-6 text-white hover:from-slate-800 hover:to-slate-700"
                  onClick={() => onNavigate("blogs")}
                >
                  Explore blog articles
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white bg-slate-50 px-6 hover:bg-white"
                  onClick={() => onNavigate("products")}
                >
                  Continue shopping
                </Button>
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-pink-500 via-rose-500 to-sky-600 p-7 text-white shadow-[0_32px_80px_-48px_rgba(236,72,153,0.65)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 backdrop-blur-sm">
                <Award className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-3xl font-black md:text-4xl">
                Turn everyday shopping into simple member rewards.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/88">
                Earn points from each order, unlock vouchers, and keep your most-used essentials feeling better value over time.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  className="rounded-full bg-white px-6 text-slate-900 hover:bg-slate-100"
                  onClick={handleRewardsClick}
                >
                  {isLoggedIn ? "Open loyalty" : "Join MumCare"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                {!isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="rounded-full border-white/50 bg-transparent px-6 text-white hover:bg-white/10"
                    onClick={onLoginClick || (() => {})}
                  >
                    I already have an account
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
