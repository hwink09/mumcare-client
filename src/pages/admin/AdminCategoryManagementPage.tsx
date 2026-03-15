import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import type { CurrentUser } from "@/hooks/useAuth";
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
} from "@/services/categoryService";

type AdminCategoryManagementPageProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  isEmbedded?: boolean;
};

type Category = {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
};

export function AdminCategoryManagementPage({ user, onLogout, isEmbedded }: AdminCategoryManagementPageProps) {
  const navigate = useNavigate();
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    title: "",
  });

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
    loadCategories();
  }, [user, isAdmin, navigate]);

  const loadCategories = async () => {
    setError(null);
    setLoading(true);
    try {
      const productData = await getProductCategories();
      setProductCategories(productData || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = productCategories;

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    try {
      await createProductCategory(formData);
      await loadCategories();
      setShowCreateDialog(false);
      setFormData({ title: "" });
    } catch (err: any) {
      setError(err?.message || "Failed to create category");
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.title.trim()) return;

    try {
      await updateProductCategory(editingCategory._id, formData);
      await loadCategories();
      setEditingCategory(null);
      setFormData({ title: "" });
    } catch (err: any) {
      setError(err?.message || "Failed to update category");
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteProductCategory(categoryId);
      await loadCategories();
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
    });
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setEditingCategory(null);
    setFormData({ title: "" });
  };

  const content = (
    <>
      <div className="mb-6 mt-4">
        <h2 className="text-xl font-bold">Product Categories</h2>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Product Categories
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Dialog open={showCreateDialog || !!editingCategory} onOpenChange={closeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={editingCategory ? handleUpdate : handleCreate}>
                    {editingCategory ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading categories...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : currentCategories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No categories found.
            </div>
          ) : (
            <div className="space-y-4">
              {currentCategories.map((category) => (
                <div key={category._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{category.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(category._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
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
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Category Management</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Manage product and blog categories for your store.
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