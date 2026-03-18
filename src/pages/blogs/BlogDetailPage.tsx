import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogById, likeBlog, dislikeBlog } from "@/services/blogService";
import { useAuth } from "@/hooks/useAuth";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type Blog = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  createdAt?: string;
  likes?: string[];
  dislikes?: string[];
};

export function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadBlog = async () => {
    if (!id) return;
    try {
      const res = await getBlogById(id);
      const blogData = (res && (Array.isArray(res) ? res[0] : (res as { data?: unknown }).data || res)) as Blog | undefined;
      setBlog(blogData ?? null);
    } catch {
      setError("Failed to load article. Please try again.");
      setBlog(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    loadBlog().finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleLike = async () => {
    if (loading) return;
    if (!user) {
      alert("Please login to like this blog.");
      return;
    }
    if (user.role && user.role !== "client") {
      alert("Only regular clients can like or dislike blogs. Staff and Admins cannot.");
      return;
    }
    if (!id || !blog) return;

    try {
      await likeBlog(id);
      await loadBlog();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("forbidden")) {
        alert("Your role does not have permission to like blogs.");
      }
    }
  };

  const handleDislike = async () => {
    if (loading) return;
    if (!user) {
      alert("Please login to dislike this blog.");
      return;
    }
    if (user.role && user.role !== "client") {
      alert("Only regular clients can like or dislike blogs. Staff and Admins cannot.");
      return;
    }
    if (!id || !blog) return;

    try {
      await dislikeBlog(id);
      await loadBlog();
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.toLowerCase().includes("forbidden")) {
        alert("Your role does not have permission to dislike blogs.");
      }
    }
  };

  const userId = user ? (user._id || user.id) : null;
  const isLiked = userId ? blog?.likes?.includes(userId as string) : false;
  const isDisliked = userId ? blog?.dislikes?.includes(userId as string) : false;

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Button variant="outline" onClick={() => navigate("/blogs")} className="mb-6">Back to Blogs</Button>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading article...</div>
        ) : !blog ? (
          <div className="text-center text-muted-foreground">Article not found</div>
        ) : (
          <div>
            <img
              src={blog.image || "https://placehold.co/1200x500?text=MumCare+Article"}
              alt={blog.title}
              className="block w-full h-auto"
            />
            <div className="pt-6">
              <h1 className="text-3xl font-bold mb-3">{blog.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ""}</p>
              <div className="prose max-w-none text-sm leading-7 text-gray-700 whitespace-pre-wrap mb-8">
                {blog.description || "No content available."}
              </div>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t">
                <Button 
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>({blog.likes?.length || 0})</span>
                </Button>
                <Button 
                  variant={isDisliked ? "default" : "outline"}
                  onClick={handleDislike}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>({blog.dislikes?.length || 0})</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
