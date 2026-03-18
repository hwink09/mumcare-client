import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { CurrentUser } from "@/hooks/useAuth";
import { getBlogById, dislikeBlog, likeBlog } from "@/services/blogService";
import { extractImageUrl } from "@/lib/image";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Blog = {
  _id: string;
  title: string;
  description?: string;
  image?: unknown;
  createdAt?: string;
  likes?: unknown[];
  dislikes?: unknown[];
};

interface BlogDetailPageProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: CurrentUser;
  onLogout?: () => void;
  cartItemCount?: number;
}

const getResolvedBlog = async (id: string) => {
  const res = await getBlogById(id);
  return (res && (Array.isArray(res) ? res[0] : (res as { data?: unknown }).data || res)) as Blog | null;
};

const formatBlogDate = (value?: string) => {
  if (!value) return "MumCare editorial";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "MumCare editorial";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getBlogImage = (blog: Blog) =>
  extractImageUrl(blog.image) || "https://placehold.co/1200x720?text=MumCare+Blog";

const toParagraphs = (value?: string) => {
  const normalized = (value || "").trim();
  if (!normalized) return [];

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+\n/g, "\n").trim())
    .filter(Boolean);
};

const estimateReadingMinutes = (value?: string) => {
  const words = (value || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
};

const includesUser = (items: unknown[] | undefined, userId: string | null) => {
  if (!userId || !Array.isArray(items)) return false;

  return items.some((item) => {
    if (typeof item === "string") return item === userId;
    if (item && typeof item === "object") {
      const candidate = item as { _id?: string; id?: string };
      return (candidate._id || candidate.id) === userId;
    }
    return false;
  });
};

export function BlogDetailPage({
  onNavigate,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  onLogout,
  cartItemCount = 0,
}: BlogDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reactionLoading, setReactionLoading] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    if (!id) {
      setBlog(null);
      setError("Article not found.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const blogData = await getResolvedBlog(id);
        if (cancelled) return;

        setBlog(blogData ?? null);
        if (!blogData) setError("Article not found.");
      } catch {
        if (cancelled) return;
        setError("Failed to load article. Please try again.");
        setBlog(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleReaction = async (type: "like" | "dislike") => {
    if (loading || reactionLoading || !id || !blog) return;

    if (!isLoggedIn || !user) {
      alert("Please login to react to this blog.");
      onLoginClick();
      return;
    }

    if (user.role && user.role !== "client") {
      alert("Only regular clients can like or dislike blogs. Staff and Admins cannot.");
      return;
    }

    try {
      setReactionLoading(type);

      if (type === "like") {
        await likeBlog(id);
      } else {
        await dislikeBlog(id);
      }

      const refreshed = await getResolvedBlog(id);
      setBlog(refreshed ?? blog);
    } catch (err: any) {
      console.error(err);
      if (err?.message && String(err.message).toLowerCase().includes("forbidden")) {
        alert("Your role does not have permission to react to blogs.");
      }
    } finally {
      setReactionLoading(null);
    }
  };

  const userId = user ? user._id || user.id || null : null;
  const isLiked = includesUser(blog?.likes, userId);
  const isDisliked = includesUser(blog?.dislikes, userId);

  const paragraphs = useMemo(() => toParagraphs(blog?.description), [blog?.description]);
  const readingMinutes = useMemo(() => estimateReadingMinutes(blog?.description), [blog?.description]);
  const leadParagraph = paragraphs[0] || "No content available.";

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
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/blogs")}
          className="rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm hover:bg-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Blogs
        </Button>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading article...</div>
        ) : !blog ? (
          <Card className="mt-6 rounded-[30px] border border-dashed border-slate-200 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.18)]">
            <CardContent className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <BookOpen className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-3xl font-black text-slate-950">Article not found</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                This article may have been removed or the link is no longer available.
              </p>
              <Button
                type="button"
                className="mt-6 h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                onClick={() => navigate("/blogs")}
              >
                Browse all blogs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-6 overflow-hidden rounded-[34px] border border-white/80 bg-white/90 shadow-[0_32px_80px_-60px_rgba(15,23,42,0.45)]">
              <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[300px] overflow-hidden bg-slate-100">
                  <div className="absolute left-5 top-5 z-10">
                    <Badge className="rounded-full bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                      <Sparkles className="mr-1 size-4" />
                      MumCare Journal
                    </Badge>
                  </div>
                  <ImageWithFallback
                    src={getBlogImage(blog)}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <CardContent className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {formatBlogDate(blog.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        {readingMinutes} min read
                      </span>
                    </div>

                    <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                      {blog.title}
                    </h1>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      {leadParagraph}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Helpful votes
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{blog.likes?.length || 0}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Not helpful
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{blog.dislikes?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                <CardContent className="p-6 sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Article Content</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950">Read the full story</h2>

                  <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-700">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((paragraph, index) => (
                        <p key={`${blog._id}-paragraph-${index}`} className="whitespace-pre-wrap">
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      <p>No content available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Article Feedback</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Was this article helpful?</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {!isLoggedIn
                        ? "Login to react to this article and save your opinion."
                        : user?.role && user.role !== "client"
                          ? "Only client accounts can like or dislike blog posts."
                          : "Choose whether this article helped you or not."}
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleReaction("like")}
                        disabled={reactionLoading !== null}
                        className={`h-auto min-h-12 rounded-2xl px-4 py-3 text-left ${
                          isLiked
                            ? "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4" />
                          {reactionLoading === "like" ? "Updating..." : `Helpful (${blog.likes?.length || 0})`}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleReaction("dislike")}
                        disabled={reactionLoading !== null}
                        className={`h-auto min-h-12 rounded-2xl px-4 py-3 text-left ${
                          isDisliked
                            ? "border-transparent bg-slate-950 text-white hover:bg-slate-900"
                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4" />
                          {reactionLoading === "dislike" ? "Updating..." : `Not helpful (${blog.dislikes?.length || 0})`}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Quick Facts</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">At a glance</h2>

                    <div className="mt-6 space-y-3">
                      <div className="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Published</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{formatBlogDate(blog.createdAt)}</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Reading time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{readingMinutes} minutes</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Reader sentiment</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {blog.likes?.length || 0} likes and {blog.dislikes?.length || 0} dislikes
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/blogs")}
                      className="mt-6 h-11 w-full rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                    >
                      Browse more articles
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
                  <CardContent className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">More From MumCare</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">Keep exploring</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Visit the full blog library for more parenting guides, nutrition tips, and care articles.
                    </p>
                    <div className="mt-5 flex flex-col gap-3">
                      <Button
                        type="button"
                        className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                        onClick={() => navigate("/blogs")}
                      >
                        Open Blog Library
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                        onClick={() => navigate("/products")}
                      >
                        Explore Products
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
