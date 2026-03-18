import {
  CheckCircle,
  Heart,
  Leaf,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";

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
      title: "Care Comes First",
      description:
        "Every product and recommendation starts with what feels safest, gentlest, and most useful for moms and babies.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted Quality",
      description:
        "We focus on reliable brands, practical essentials, and products chosen with safety and comfort in mind.",
    },
    {
      icon: Users,
      title: "Human Support",
      description:
        "MumCare is built to feel approachable, with clear guidance and responsive support when families need help.",
    },
    {
      icon: TrendingUp,
      title: "Growing With Families",
      description:
        "We keep refining the experience as customer needs change, from pregnancy prep to daily baby care.",
    },
  ];

  const highlights = [
    { label: "Serving families", value: "10,000+" },
    { label: "Curated essentials", value: "150+" },
    { label: "Built with care", value: "Since 2020" },
  ];

  const milestones = [
    { year: "2020", event: "Started MumCare with a simple goal: make trusted care products easier to find." },
    { year: "2021", event: "Expanded support for more families looking for safe nutrition and baby essentials." },
    { year: "2023", event: "Improved the shopping experience with better categories, rewards, and helpful content." },
    { year: "Today", event: "Continuing to build a calmer, more supportive place for modern parenting needs." },
  ];

  const promiseList = [
    "Carefully selected products for pregnancy, newborn care, feeding, and daily routines.",
    "Helpful guidance and content that feels practical instead of overwhelming.",
    "Fast, simple shopping with loyalty rewards and support that stays approachable.",
    "A warmer shopping experience designed for real family life, not just checkout flows.",
  ];

  const teamGroups = [
    {
      title: "Product Curation",
      subtitle: "Researching daily essentials",
      image:
        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Customer Care",
      subtitle: "Supporting moms with clarity",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Content & Guidance",
      subtitle: "Sharing helpful parenting tips",
      image:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(253,242,248,0.65),rgba(255,255,255,1)_18%,rgba(239,246,255,0.85)_100%)]">
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

      <main className="container mx-auto flex-1 px-4 py-8 sm:py-10">
        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_32px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Badge className="rounded-full bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                <Sparkles className="mr-1 size-4" />
                About MumCare
              </Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                A gentler store experience for moms, babies, and everyday care.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                MumCare was created to make parenting essentials feel easier to explore. We bring together trusted
                products, practical guidance, and a warmer shopping experience for families at every stage.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => onNavigate("products")}
                  className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                >
                  Explore products
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate("contact")}
                  className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  Contact MumCare
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-[30px] border border-pink-100 bg-[linear-gradient(135deg,rgba(244,114,182,0.12),rgba(14,165,233,0.12))] p-2">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80"
                  alt="Mother and baby"
                  className="h-[280px] w-full rounded-[24px] object-cover sm:h-[340px]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-slate-100 bg-slate-50 px-5 py-4 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Our Story</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">Built from real care, not just inventory.</h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-slate-600">
                <p>
                  MumCare began with a simple belief: families should not have to feel uncertain when choosing products
                  for pregnancy, newborn care, feeding, and everyday routines.
                </p>
                <p>
                  We wanted to create a place that feels calmer and more trustworthy, where essentials are easier to
                  discover and the experience feels supportive from the first click to checkout.
                </p>
                <p>
                  Today, MumCare continues to grow as a curated destination for modern parenting needs, with a focus on
                  practical value, safety, and warmth.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <div className="grid h-full gap-0 sm:grid-cols-[0.92fr_1.08fr]">
              <div className="bg-slate-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=1200&q=80"
                  alt="MumCare story"
                  className="h-full min-h-[250px] w-full object-cover"
                />
              </div>
              <CardContent className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">What We Believe</p>
                <h2 className="mt-3 text-2xl font-black text-slate-950">Simple choices matter when families are busy.</h2>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  That is why we aim to pair useful products with clearer navigation, kinder design, and guidance that
                  helps people shop with confidence.
                </p>
              </CardContent>
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Core Values</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">What shapes the MumCare experience</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]"
                >
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-2xl bg-[linear-gradient(135deg,rgba(244,114,182,0.14),rgba(14,165,233,0.14))] p-3">
                      <Icon className="size-6 text-pink-600" />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-slate-900">{value.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Why Families Choose Us</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">A calmer, more reliable shopping flow</h2>
              <div className="mt-6 space-y-4">
                {promiseList.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 size-5 shrink-0 text-pink-600" />
                    <p className="text-base leading-7 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="inline-flex rounded-xl bg-pink-100 p-2">
                    <Truck className="size-5 text-pink-600" />
                  </div>
                  <h3 className="mt-4 font-black text-slate-900">Faster essentials</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Smooth checkout and rewards that support repeat orders.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="inline-flex rounded-xl bg-sky-100 p-2">
                    <Leaf className="size-5 text-sky-600" />
                  </div>
                  <h3 className="mt-4 font-black text-slate-900">Gentle choices</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">A curated catalog designed around comfort, trust, and practical use.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Our Journey</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">How MumCare has grown</h2>
              <div className="mt-6 space-y-4">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.year}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] text-sm font-black text-white">
                      {milestone.year}
                    </div>
                    <p className="self-center text-base leading-7 text-slate-600">{milestone.event}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Behind MumCare</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">The teams shaping the experience</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {teamGroups.map((group) => (
              <Card
                key={group.title}
                className="overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]"
              >
                <div className="aspect-[16/11] overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={group.image}
                    alt={group.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-black text-slate-900">{group.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{group.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[34px] border border-transparent bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] p-[1px] shadow-[0_32px_80px_-60px_rgba(15,23,42,0.45)]">
          <div className="rounded-[33px] bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] px-6 py-10 text-center backdrop-blur sm:px-8">
            <h2 className="text-3xl font-black text-white sm:text-4xl">Thanks for growing with MumCare</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/88 sm:text-lg">
              Whether you are exploring essentials, reading tips, or placing your next order, we want the experience
              to feel calm, helpful, and genuinely supportive.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => onNavigate("products")}
                className="h-11 rounded-full bg-white px-5 font-semibold text-slate-900 hover:bg-slate-100"
              >
                Shop MumCare
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("blogs")}
                className="h-11 rounded-full border-white/60 bg-transparent px-5 font-semibold text-white hover:bg-white/10"
              >
                Read blog tips
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
