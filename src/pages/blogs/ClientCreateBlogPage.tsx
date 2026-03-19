import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/error";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createBlog } from "@/services/blogService";
import type { CurrentUser } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface ClientCreateBlogPageProps {
  user?: CurrentUser | null;
}

export function ClientCreateBlogPage({ user }: ClientCreateBlogPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      const msg = "Title and content are required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("content", formData.content);
      if (image) submitData.append("image", image);

      await createBlog(submitData);
      setSuccess(true);
      setFormData({ title: "", content: "" });
      setImage(null);
      toast.success("Blog post created successfully!");

      // Auto-redirect to blogs list after success
      setTimeout(() => navigate("/blogs"), 2000);

    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create blog post.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  if (!user) return null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Card className="border-0 shadow-lg mt-8">
        <CardHeader className="text-center rounded-t-xl bg-linear-to-r from-pink-500/10 to-blue-500/10 border-b">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-blue-600">
            Write a New Blog Post
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2">
            Share your thoughts, tips, and experiences with the MumCare community.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
              <h2 className="text-xl font-semibold">Post created successfully!</h2>
              <p className="text-muted-foreground">You will be redirected shortly...</p>
              <Button onClick={() => navigate("/blogs")} variant="outline" className="mt-4">
                View Blogs
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">Post Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="E.g., 5 Tips for Newborn Sleep"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold">Cover Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer file:cursor-pointer file:border-0 file:bg-primary/10 file:text-primary file:font-semibold file:rounded-md file:px-4 file:py-2 hover:file:bg-primary/20"
                  />
                </div>
                {image && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {image.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-base font-semibold">Content <span className="text-red-500">*</span></Label>
                <Textarea
                  id="content"
                  placeholder="Write your article here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[300px] resize-y"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-linear-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 px-8"
                >
                  {loading ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
