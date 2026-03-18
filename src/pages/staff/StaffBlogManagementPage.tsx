import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import type { CurrentUser } from "@/hooks/useAuth";
import { getBlogs, createBlog, updateBlog, deleteBlog } from "@/services/blogService";
import { getBlogCategories } from "@/services/categoryService";

type StaffBlogManagementPageProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  isEmbedded?: boolean;
};

type Blog = {
  _id: string;
  title: string;
  description: string;
  categoryId?: string;
  author?: Array<{ userId: string; fullName: string }>;
  image?: string;
  likes?: string[];
  dislikes?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type Category = {
  _id: string;
  title: string;
};

export function StaffBlogManagementPage({ user, onLogout, isEmbedded }: StaffBlogManagementPageProps) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
  });
  const [image, setImage] = useState<File | null>(null);

  const isStaff = useMemo(() => user?.role === "staff" || user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isStaff) {
      navigate("/");
      return;
    }
    loadData();
  }, [user, isStaff, navigate]);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    setCategoriesLoading(true);
    try {
      const [blogsData, categoriesData] = await Promise.all([
        getBlogs(),
        getBlogCategories(),
      ]);
      setBlogs(blogsData || []);
      setCategories(categoriesData || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
      setError("Please fill in all required fields (Title, Category, Description).");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      if (formData.categoryId) submitData.append("categoryId", formData.categoryId);
      if (image) submitData.append("image", image);

      await createBlog(submitData);
      await loadData();
      setShowCreateDialog(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create blog");
    }
  };

  const handleUpdate = async () => {
    if (!editingBlog || !formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
      setError("Please fill in all required fields (Title, Category, Description).");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      if (formData.categoryId) submitData.append("categoryId", formData.categoryId);
      if (image) submitData.append("image", image);

      await updateBlog(editingBlog._id, submitData);
      await loadData();
      setEditingBlog(null);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update blog");
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await deleteBlog(blogId);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to delete blog");
    }
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description || "",
      categoryId: blog.categoryId || "",
    });
    setImage(null);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", categoryId: "" });
    setImage(null);
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setEditingBlog(null);
    resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
  };

  const content = (
    <Card className="border-0 shadow-lg shadow-slate-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Blogs</CardTitle>
          <Button onClick={() => setShowCreateDialog(true)}>
            Create Blog
          </Button>
          <Dialog open={showCreateDialog || !!editingBlog} onOpenChange={closeDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBlog ? "Edit Blog" : "Create New Blog"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter blog title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value: string) => setFormData(prev => ({ ...prev, categoryId: value }))} disabled={categoriesLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter blog description"
                    rows={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Blog Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {image && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {image.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={editingBlog ? handleUpdate : handleCreate}>
                    {editingBlog ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading blogs...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No blogs found.
          </div>
        ) : (
          <div className="space-y-4">
            {blogs.map((blog) => (
              <div key={blog._id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex gap-4 items-start">
                    {blog.image && (
                      <div className="hidden sm:block shrink-0 rounded overflow-hidden shadow w-24 h-24 bg-slate-100">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{blog.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {blog.description ? blog.description.substring(0, 150) : ""}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Likes: {blog.likes?.length || 0}</span>
                        <span>Dislikes: {blog.dislikes?.length || 0}</span>
                        {blog.createdAt && (
                          <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                { (user?.role === "admin" || (blog.author && Array.isArray(blog.author) && blog.author.some((a: any) => a.userId === user?._id))) && (
                  <div className="flex gap-2 ml-4 shrink-0 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(blog)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(blog._id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isEmbedded) return <>{content}</>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Blog Management</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Create, edit and manage blog posts for your store.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>
                Back to Dashboard
              </Button>
            </div>
          </div>

          <Card className="border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg shadow-indigo-200/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Signed in as</div>
                  <div className="font-semibold text-lg">
                    {user?.firstName || "Admin"} {user?.lastName || ""}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right">{user?.email || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Role</span>
                  <Badge variant="secondary">Administrator</Badge>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onLogout();
                  navigate("/login");
                }}
                className="w-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>

        {content}
      </div>
    </div>
  );
}

export default StaffBlogManagementPage;
