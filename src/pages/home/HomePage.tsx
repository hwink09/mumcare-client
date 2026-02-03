import { ArrowRight, Star, TrendingUp, Award, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import type { Product } from "@/types/product";

interface HomePageProps {
  featuredProducts: Product[];
  onNavigate: (page: string) => void;
  onAddToCart: (product: Product) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogoutClick?: () => void;
}

export function HomePage({ featuredProducts, onNavigate, onAddToCart, onLoginClick, onRegisterClick, isLoggedIn = false, user, onLogoutClick }: HomePageProps) {
  const featuredArticles = [
    {
      id: "1",
      title: "Essential Nutrients During Pregnancy",
      excerpt: "Learn about the key vitamins and minerals you need for a healthy pregnancy...",
      image: "https://images.unsplash.com/photo-1734607404585-bd97529f1f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVnbmFuY3klMjBudXRyaXRpb24lMjBndWlkZXxlbnwxfHx8fDE3Njk2MDYzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Pregnancy",
      readTime: "5 min",
    },
    {
      id: "2",
      title: "First Year Baby Feeding Guide",
      excerpt: "A complete guide to feeding your baby from newborn to 12 months...",
      image: "https://images.unsplash.com/photo-1604599730009-fe273616197c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBiYWJ5JTIwaGVhbHRoJTIwY29uc3VsdGF0aW9ufGVufDF8fHx8MTc2OTYwNjMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Baby Care",
      readTime: "8 min",
    },
    {
      id: "3",
      title: "Postpartum Nutrition Tips",
      excerpt: "How to nourish your body after childbirth and while breastfeeding...",
      image: "https://images.unsplash.com/photo-1685900464809-5edadb95da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRlcm5hbCUyMG51dHJpdGlvbnxlbnwxfHx8fDE3Njk2MDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Postnatal",
      readTime: "6 min",
    },
  ];

  return (

    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      {/* Header */}
      <Header
        cartItemCount={0}
        onCartClick={() => { }}
        onLoginClick={onLoginClick || (() => { })}
        onRegisterClick={onRegisterClick || (() => { })}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogoutClick}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge className="bg-pink-500">Trusted by 10,000+ Families</Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Premium Nutrition for{" "}
                <span className="bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Mom & Baby
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                From pregnancy to toddlerhood, we provide certified, high-quality milk and care
                products backed by expert health advice.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => onNavigate("products")}>
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("articles")}>
                  Health Tips
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-blue-400 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">4.9/5 from 2,340 reviews</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1663028051021-07b4f67a6bd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHByZWduYW50JTIwd29tYW4lMjBzaG9wcGluZ3xlbnwxfHx8fDE3Njk2MDYzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy family"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Certified Quality",
                description: "All products tested & approved",
              },
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On orders over $50",
              },
              {
                icon: Award,
                title: "Loyalty Rewards",
                description: "Earn points on every purchase",
              },
              {
                icon: TrendingUp,
                title: "Expert Advice",
                description: "Health tips from professionals",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 pb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-blue-100 mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Best sellers chosen by our community</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("products")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button size="sm" onClick={() => onAddToCart(product)}>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Health Articles */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Health & Care Tips</h2>
              <p className="text-muted-foreground">Expert advice for your journey</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("articles")}>
              View All Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 bg-gray-100">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-white text-primary">
                    {article.category}
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                    <Button variant="ghost" size="sm">
                      Read More →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty Program CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Loyalty Program
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Earn points on every purchase, get exclusive vouchers, and enjoy special member benefits
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Families</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Premium Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.5%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
