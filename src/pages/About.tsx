import { Heart, Users, TrendingUp, CheckCircle, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogout?: () => void;
  cartItemCount?: number;
}

export function AboutPage({
  onNavigate,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  onLogout,
  cartItemCount = 0,
}: AboutPageProps) {
  const values = [
    {
      icon: Heart,
      title: "Care First",
      description:
        "We prioritize the health and well-being of mothers and babies in everything we do.",
    },
    {
      icon: Leaf,
      title: "Quality Products",
      description:
        "Only premium, safe, and certified products that meet international standards.",
    },
    {
      icon: Users,
      title: "Customer Support",
      description:
        "Dedicated support team available 24/7 to help with your needs.",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description:
        "Continuously researching and sourcing the latest products for mothers and babies.",
    },
  ];

  const milestones = [
    { year: "2020", event: "MumCare Store Founded" },
    { year: "2021", event: "First 1000 Happy Customers" },
    { year: "2022", event: "Expanded Product Range" },
    { year: "2023", event: "Launched Mobile App" },
    { year: "2024", event: "Opened Physical Store" },
    { year: "2025", event: "10,000+ Satisfied Customers" },
  ];

  const team = [
    {
      name: "Cao Trần Hoàng Minh",
      role: "Founder",
      image:
        "",
    },
    {
      name: "Trần Gia Huy",
      role: "Thằng cac",
      image:
        "",
    },
    {
      name: "Phạm Xuân Lộc",
      role: "...",
      image:
        "",
    },
    {
      name: "Thành Ngọc",
      role: "...",
      image:
        "",
    },

    {
      name: "Kit",
      role: "...",
      image:
        "",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={onCartClick}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Hero Section */}
      <section className="bg-linear-to-r from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About MumCare Store</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dedicated to providing premium nutrition and care products for mothers
            and babies since 2020. We believe every mother and baby deserves the best.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                MumCare Store was founded in 2020 with a simple mission: to make
                premium mother and baby care products accessible to everyone. Our
                founder, Abc, started this journey after experiencing the
                challenges of finding quality, trusted products during her pregnancy.
              </p>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                What began as a small online store has grown into a trusted platform
                serving over 10,000 satisfied customers. We carefully curate every
                product to ensure it meets our high standards for quality, safety, and
                effectiveness.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Today, we are committed to supporting mothers at every stage of their
                journey, from pregnancy to early parenthood, with expert guidance and
                premium products.
              </p>
            </div>
            <div className="relative">
              <div className="bg-linear-to-br from-pink-200 to-blue-200 rounded-2xl p-1">
                <ImageWithFallback
                  src="https://plus.unsplash.com/premium_photo-1676032287637-1aa4d1f93d50?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bW9tJTIwYW5kJTIwYmFieXxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Our Story"
                  className="rounded-2xl w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="bg-linear-to-br from-pink-100 to-blue-100 p-4 rounded-full">
                        <IconComponent className="h-8 w-8 text-pink-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-center text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map((milestone, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-linear-to-r from-pink-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {milestone.event}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our dedicated team works tirelessly to bring you the best products and
            customer experience in the market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-gray-300">
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="pt-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-sm text-pink-600 font-medium">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose MumCare</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                "100% Original Products - All items are verified and authentic",
                "Expert Recommendations - Our team includes certified nutritionists",
                "Fast & Free Shipping - On orders over 500,000 VND",
                "Hassle-Free Returns - 30-day return policy",
                "Customer Reviews - Transparent ratings from verified buyers",
                "24/7 Customer Support - Always here when you need us",
              ].map((reason, index) => (
                <div key={index} className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-pink-600 shrink-0 mt-1" />
                  <p className="text-lg text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-pink-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Community
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Become part of thousands of happy mothers who trust MumCare for their
            nutrition and baby care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate("products")}
              className="bg-white text-pink-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg"
            >
              Shop Now
            </Button>
            <Button
              onClick={() => onNavigate("contact")}
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-lg"
            >
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
