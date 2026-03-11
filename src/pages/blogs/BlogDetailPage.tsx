import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogById } from "@/services/blogService";

type Blog = {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  createdAt?: string;
};

export function BlogDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await getBlogById(id);
        if (mounted) setBlog((res?.data || res) as Blog);
      } catch {
        if (mounted) {
          setError("Failed to load article. Please try again.");
          setBlog(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Button variant="outline" onClick={() => navigate("/blogs")} className="mb-6">Back to Articles</Button>

        {error && <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading article...</div>
        ) : !blog ? (
          <div className="text-center text-muted-foreground">Article not found</div>
        ) : (
          <Card className="overflow-hidden">
            <div className="h-72 bg-gray-100">
              <img src={blog.image || "https://placehold.co/1200x500?text=MomCare+Article"} alt={blog.title} className="w-full h-full object-cover" />
            </div>
            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold mb-3">{blog.title}</h1>
              <p className="text-sm text-muted-foreground mb-6">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ""}</p>
              <div className="prose max-w-none text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                {blog.content || blog.description || "No content available."}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
