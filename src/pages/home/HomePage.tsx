import { ArrowRight, Star, TrendingUp, Award, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import type { Product, Category } from "@/types/product";
import { useEffect, useState } from "react";
import productService from "@/services/productService";
import "@/styles/home.css";

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
  const [localFeatured, setLocalFeatured] = useState<Product[]>(featuredProducts || []);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch categories
        const catResp = await productService.getCategories();
        const cats = catResp.data || [];
        const mappedCats: Category[] = cats.map((c: any) => ({
          id: c._id || c.id,
          name: c.name || c.title || "",
          slug: c.slug,
        }));
        if (mounted) setCategories(mappedCats);

        // Fetch products if not provided
        if ((featuredProducts?.length || 0) === 0) {
          const resp = await productService.getProducts({ page: 1, limit: 8 });
          const products = resp.data || [];
          const mapped: Product[] = products.map((p: any) => ({
            id: p._id || p.id,
            name: p.title || p.name,
            description: p.description || "",
            price: Number(p.price) || 0,
            image: Array.isArray(p.images) && p.images.length ? p.images[0] : "/",
            tags: [],
          }));
          if (mounted) setLocalFeatured(mapped);
        } else {
          setLocalFeatured(featuredProducts);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    fetchData();
    return () => { mounted = false };
  }, [featuredProducts]);

  return (
    <div className="home-container">
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
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content">
              <Badge className="bg-pink-500">Trusted by 10,000+ Families</Badge>
              <h1 className="hero-title">
                Premium Nutrition for{" "}
                <span className="hero-gradient-text">
                  Mom & Baby
                </span>
              </h1>
              <p className="hero-subtitle">
                From pregnancy to toddlerhood, we provide certified, high-quality milk and care
                products backed by expert health advice.
              </p>
              <div className="hero-buttons">
                <Button size="lg" onClick={() => onNavigate("products")}>
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("articles")}>
                  Health Tips
                </Button>
              </div>
              <div className="hero-reviews">
                <div className="avatar-stack">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="avatar-item"
                    />
                  ))}
                </div>
                <div className="review-section">
                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="star-icon" />
                    ))}
                  </div>
                  <p className="review-text">4.9/5 from 2,340 reviews</p>
                </div>
              </div>
            </div>
            <div className="hero-image">
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
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
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
                <Card key={idx} className="feature-card">
                  <CardContent className="feature-card-content">
                    <div className="feature-icon-wrapper">
                      <Icon className="feature-icon" />
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="categories-container">
          <h2 className="categories-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Card key={category.id} className="category-card">
                <CardContent className="category-card-content">
                  <div className="category-icon-wrapper">
                    <span className="category-emoji">📦</span>
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                  <Button size="sm" variant="outline">
                    Browse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="featured-products-container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Best sellers chosen by our community</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("products")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="products-grid">
            {localFeatured.slice(0, 4).map((product) => (
              <Card key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-tags-wrapper">
                    {product.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="product-tag">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardContent className="product-card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">
                    {product.description}
                  </p>
                  <div className="product-footer">
                    <span className="product-price">
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
      {/* Sẽ thêm section này khi có API từ backend */}

      {/* Loyalty Program CTA */}
      <section className="loyalty-section">
        <div className="loyalty-container">
          <div className="loyalty-content">
            <Award className="loyalty-icon" />
            <h2 className="loyalty-title">
              Join Our Loyalty Program
            </h2>
            <p className="loyalty-subtitle">
              Earn points on every purchase, get exclusive vouchers, and enjoy special member benefits
            </p>
            <div className="loyalty-buttons">
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
      <section className="trust-section">
        <div className="trust-container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-number">10K+</div>
              <div className="trust-label">Happy Families</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">500+</div>
              <div className="trust-label">Premium Products</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">99.5%</div>
              <div className="trust-label">Satisfaction Rate</div>
            </div>
            <div className="trust-item">
              <div className="trust-number">24/7</div>
              <div className="trust-label">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
