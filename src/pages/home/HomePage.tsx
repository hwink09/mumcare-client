import { ArrowRight, Star, TrendingUp, Award, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import type { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";

interface HomePageProps {
  featuredProducts?: Product[];
  onNavigate: (page: string) => void;
  onAddToCart: (product: Product) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogoutClick?: () => void;
}

export function HomePage({ featuredProducts, onNavigate, onAddToCart, onLoginClick, onRegisterClick, isLoggedIn = false, user, onLogoutClick }: HomePageProps) {
  const [localFeatured, setLocalFeatured] = useState<Product[]>(featuredProducts || []);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch products if not provided
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
        console.error('Failed to load data', error);
      }
    };

    fetchData();
    return () => { mounted = false };
  }, [featuredProducts]);

  const handleAddToCartClick = (product: Product) => {
    onAddToCart(product);
    setAddedMessage(`Added "${product.name}" to cart`);
    setTimeout(() => setAddedMessage(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header
        cartItemCount={0}
        onCartClick={() => onNavigate("cart")}
        onLoginClick={onLoginClick || (() => { })}
        onRegisterClick={onRegisterClick || (() => { })}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogoutClick}
      />

      {/* Simple add-to-cart toast */}
      {addedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-md bg-emerald-600 text-white px-4 py-2 text-sm shadow-lg">
          {addedMessage}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-linear-to-r from-pink-50 via-purple-50 to-blue-50 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 text-sm rounded-full">Trusted by 10,000+ Families</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Premium Nutrition <br className="hidden md:block"/> for{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-blue-600">
                  Mom & Baby
                </span>
              </h1>
              <p className="text-lg text-slate-600 md:max-w-lg leading-relaxed">
                From pregnancy to toddlerhood, we provide certified, high-quality milk and care
                products backed by expert health advice.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" className="bg-linear-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white border-0 shadow-lg rounded-full px-8" onClick={() => onNavigate("products")}>
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-8 shadow-sm bg-white" onClick={() => onNavigate("blogs")}>
                  Blogs
                </Button>
              </div>
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">4.9/5 from 2,340 reviews</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-pink-200 to-blue-200 rounded-3xl transform rotate-3 scale-105 opacity-50 blur-lg"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1663028051021-07b4f67a6bd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHByZWduYW50JTIwd29tYW4lMjBzaG9wcGluZ3xlbnwxfHx8fDE3Njk2MDYzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy family"
                className="relative rounded-3xl shadow-2xl object-cover w-full aspect-4/3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                description: "All products tested & approved",
                color: "text-emerald-500",
                bg: "bg-emerald-50"
              },
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On orders over $50",
                color: "text-blue-500",
                bg: "bg-blue-50"
              },
              {
                icon: Award,
                title: "Loyalty Rewards",
                description: "Earn points on every purchase",
                color: "text-amber-500",
                bg: "bg-amber-50"
              },
              {
                icon: TrendingUp,
                title: "Expert Advice",
                description: "Health tips from professionals",
                color: "text-pink-500",
                bg: "bg-pink-50"
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto w-14 h-14 ${feature.bg} ${feature.color} rounded-full flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Products</h2>
              <p className="text-slate-600">Best sellers chosen by our community</p>
            </div>
            <Button variant="outline" className="rounded-full bg-white" onClick={() => onNavigate("products")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {localFeatured.slice(0, 4).map((product) => (
              <Card key={product.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full">
                <div className="relative aspect-square overflow-hidden bg-slate-100 p-4">
                  <ImageWithFallback
                    src={
                      typeof product.image === "string" && product.image
                        ? product.image
                        : Array.isArray(product.images) && product.images.length
                          ? product.images[0]
                          : typeof product.images === "string" && product.images
                            ? product.images
                            : "https://placehold.co/600x400?text=MomCare"
                    }
                    alt={product.name ?? "Product"}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {product.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col grow">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 grow">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xl font-extrabold text-pink-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button size="sm" className="rounded-full bg-slate-900 hover:bg-slate-800 text-white" onClick={() => handleAddToCartClick(product)}>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Program CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-pink-600 to-blue-700"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
              <Award className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Loyalty Program
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Earn points on every purchase, get exclusive vouchers, and enjoy special member benefits
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 border-0 rounded-full px-8 shadow-lg" onClick={onLoginClick || (() => {})}>
                Sign Up Now
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white/50 hover:bg-white/10 rounded-full px-8">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b border-slate-100 flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 mb-2">10K+</div>
              <div className="text-sm md:text-base text-slate-500 font-medium">Happy Families</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 mb-2">500+</div>
              <div className="text-sm md:text-base text-slate-500 font-medium">Premium Products</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 mb-2">99.5%</div>
              <div className="text-sm md:text-base text-slate-500 font-medium">Satisfaction Rate</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl md:text-4xl font-black text-slate-800 mb-2">24/7</div>
              <div className="text-sm md:text-base text-slate-500 font-medium">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
