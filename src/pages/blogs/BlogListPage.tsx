import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  Sparkles,
  ThumbsDown,
} from "lucide-react";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { extractImageUrl } from "@/lib/image";
import { getBlogCategories, getBlogs } from "@/services/blogService";

type BlogCategory = { _id: string; name: string };
type BlogCategoryApi = {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
};

type BlogCategoryRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      title?: string;
    }
  | null
  | undefined;

type Blog = {
  _id: string;
  title: string;
  description?: string;
  categoryId?: BlogCategoryRef;
  category?: BlogCategoryRef;
  image?: unknown;
  createdAt?: string;
  likes?: unknown[];
  dislikes?: unknown[];
};

interface BlogListPageProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string; role?: string };
  onLogout?: () => void;
  cartItemCount?: number;
}

const getCategoryId = (value: BlogCategoryRef) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value._id || value.id || "";
  return "";
};

const getInlineCategoryName = (value: BlogCategoryRef) => {
  if (value && typeof value === "object") {
    return (value.name || value.title || "").trim();
  }

  return "";
};

const toTimestamp = (value?: string) => {
  if (!value) return 0;

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatBlogDate = (value?: string) => {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const toPreview = (value?: string, maxChars = 150) => {
  const normalized = (value || "Read this helpful article for your health and care journey.")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars).trimEnd()}...`;
};

const getBlogImage = (blog: Blog) =>
  extractImageUrl(blog.image) || "https://placehold.co/1200x720?text=MumCare+Blog";

export function BlogListPage({
  onNavigate,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  onLogout,
  cartItemCount = 0,
}: BlogListPageProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const [catRes, blogRes] = await Promise.all([getBlogCategories(), getBlogs()]);

        if (!mounted) return;

        const cats = (
          Array.isArray(catRes) ? catRes : (catRes as { data?: unknown }).data || []
        ) as BlogCategoryApi[];
        const normalizedCategories: BlogCategory[] = cats
          .map((category) => ({
            _id: category._id || category.id || "",
            name: (category.name || category.title || "").trim(),
          }))
          .filter((category) => category._id && category.name);

        const blogsData = (
          Array.isArray(blogRes) ? blogRes : (blogRes as { data?: unknown }).data || []
        ) as Blog[];

        const normalizedBlogs = [...blogsData].sort(
          (left, right) => toTimestamp(right.createdAt) - toTimestamp(left.createdAt),
        );

        setCategories(normalizedCategories);
        setBlogs(normalizedBlogs);
      } catch {
        if (!mounted) return;

        setError("Failed to load articles. Please try again.");
        setCategories([]);
        setBlogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category._id, category.name])),
    [categories],
  );

  const filteredBlogs = useMemo(() => {
    if (!activeCategory) return blogs;
    return blogs.filter((blog) => getCategoryId(blog.categoryId ?? blog.category) === activeCategory);
  }, [activeCategory, blogs]);

  const featuredBlog = filteredBlogs[0] || null;
  const secondaryBlogs = filteredBlogs.slice(1);
  const activeCategoryLabel = activeCategory
    ? categoryMap.get(activeCategory) || "Selected topic"
    : "All articles";

  const resolveCategoryLabel = (blog: Blog) => {
    const categoryRef = blog.categoryId ?? blog.category;
    return (
      categoryMap.get(getCategoryId(categoryRef)) ||
      getInlineCategoryName(categoryRef) ||
      "Parenting Tips"
    );
  };

  const renderBlogCard = (blog: Blog, compact = false) => (
    <Card
      key={blog._id}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/blogs/${blog._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/blogs/${blog._id}`);
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_38px_88px_-50px_rgba(15,23,42,0.42)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className={`relative overflow-hidden bg-slate-100 ${compact ? "aspect-[16/10]" : "aspect-[16/11]"}`}>
        <div className="absolute left-4 top-4 z-10">
          <Badge className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {resolveCategoryLabel(blog)}
          </Badge>
        </div>
        <ImageWithFallback
          src={getBlogImage(blog)}
          alt={blog.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <CardContent className="flex grow flex-col p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatBlogDate(blog.createdAt) || "MumCare editorial"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5 text-pink-500" />
            {blog.likes?.length || 0}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsDown className="size-3.5 text-slate-400" />
            {blog.dislikes?.length || 0}
          </span>
        </div>

        <h3 className={`mt-4 font-black text-slate-900 ${compact ? "line-clamp-2 text-xl" : "line-clamp-2 text-2xl"}`}>
          {blog.title}
        </h3>
        <p className={`mt-3 grow text-slate-500 ${compact ? "line-clamp-3 text-sm leading-7" : "line-clamp-4 leading-8"}`}>
          {toPreview(blog.description, compact ? 120 : 180)}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-500">Read article</span>
          <Button
            variant="outline"
            className="h-9 rounded-full border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/blogs/${blog._id}`);
            }}
          >
            View details
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                <Sparkles className="mr-1 size-4" />
                MumCare Journal
              </Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Helpful stories, guides, and care tips for every stage.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Explore short, practical articles about baby care, pregnancy, nutrition, and everyday parenting support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Articles</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{filteredBlogs.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Category</p>
                <p className="mt-1 text-base font-black text-slate-900">{activeCategoryLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`h-11 rounded-full px-5 text-sm font-semibold ${
              activeCategory
                ? "bg-white text-slate-700 hover:bg-slate-50"
                : "bg-slate-950 text-white hover:bg-slate-900"
            }`}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              type="button"
              variant="outline"
              onClick={() => setActiveCategory(category._id)}
              className={`h-11 rounded-full px-5 text-sm font-semibold ${
                activeCategory === category._id
                  ? "border-transparent bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] text-white hover:opacity-95"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading articles...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm">
            <BookOpen className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-4 text-2xl font-black text-slate-900">No articles in this category yet</h2>
            <p className="mt-3 text-slate-500">Try another topic or switch back to all articles.</p>
            <Button
              type="button"
              className="mt-6 rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
              onClick={() => setActiveCategory("")}
            >
              Show all articles
            </Button>
          </div>
        ) : (
          <>
            {featuredBlog && (
              <section className="mt-8">
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/blogs/${featuredBlog._id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(`/blogs/${featuredBlog._id}`);
                    }
                  }}
                  className="group overflow-hidden rounded-[34px] border border-white/80 bg-white/90 shadow-[0_32px_80px_-60px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_36px_88px_-56px_rgba(15,23,42,0.48)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
                    <div className="relative min-h-[280px] overflow-hidden bg-slate-100">
                      <div className="absolute left-5 top-5 z-10">
                        <Badge className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white">
                          Featured article
                        </Badge>
                      </div>
                      <ImageWithFallback
                        src={getBlogImage(featuredBlog)}
                        alt={featuredBlog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <CardContent className="flex flex-col justify-between p-6 sm:p-8">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          {resolveCategoryLabel(featuredBlog)}
                        </p>
                        <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
                          {featuredBlog.title}
                        </h2>
                        <p className="mt-4 text-base leading-8 text-slate-600">
                          {toPreview(featuredBlog.description, 220)}
                        </p>
                      </div>

                      <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-4" />
                            {formatBlogDate(featuredBlog.createdAt) || "Fresh from MumCare"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Heart className="size-4 text-pink-500" />
                            {featuredBlog.likes?.length || 0} likes
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <ThumbsDown className="size-4 text-slate-400" />
                            {featuredBlog.dislikes?.length || 0} dislikes
                          </span>
                        </div>

                        <Button
                          className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/blogs/${featuredBlog._id}`);
                          }}
                        >
                          Read featured article
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </section>
            )}

            {secondaryBlogs.length > 0 && (
              <section className="mt-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Latest reads</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">More articles to explore</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {secondaryBlogs.map((blog) => renderBlogCard(blog, true))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
