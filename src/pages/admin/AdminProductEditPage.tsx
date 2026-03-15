import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import type { CurrentUser } from "@/hooks/useAuth";
import { updateProduct, getCategories, getProducts, getProductById } from "@/services/productService";

type AdminProductEditPageProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
};

type Category = {
  _id: string;
  title: string;
  description?: string;
};

export function AdminProductEditPage({ user, onLogout }: AdminProductEditPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    price: "",
    quantity: "",
    categoryId: "",
  });
  
  const [existingBrands, setExistingBrands] = useState<string[]>([]);
  // We don't populate images on edit yet, uploading new images replaces the old ones (or similar behavior defined by backend)
  const [images, setImages] = useState<File[]>([]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
    
    // Load dropdown data
    loadCategories();
    loadBrands();
    
    // Load Product Data
    if (id) {
      loadProductData(id);
    } else {
      setError("Product ID is missing.");
      setInitialLoading(false);
    }
  }, [user, isAdmin, navigate, id]);

  const loadProductData = async (productId: string) => {
    try {
      const product = await getProductById?.(productId) || await fetchProductFallback(productId);
      
      setFormData({
        title: product.title || product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        price: product.price?.toString() || "0",
        quantity: product.quantity?.toString() || "0",
        categoryId: product.categoryId || product.category || "",
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load product details.");
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchProductFallback = async (productId: string) => {
    // If getProductById is not defined in productService, we can fetch from the list as a fallback
    const res = await getProducts({ limit: 1000 });
    const pList = Array.isArray(res) ? res : res?.products || [];
    const product = pList.find((p: any) => p._id === productId || p.id === productId);
    if (!product) throw new Error("Product not found");
    return product;
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getProducts({ limit: 1000 });
      const productsList = Array.isArray(data) ? data : data?.products || [];
      const uniqueBrands = Array.from(new Set(productsList.map((p: any) => p.brand).filter(Boolean))) as string[];
      setExistingBrands(uniqueBrands);
    } catch (err) {
      console.error("Failed to load brands:", err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("brand", formData.brand);
      submitData.append("price", formData.price);
      submitData.append("quantity", formData.quantity);
      submitData.append("categoryId", formData.categoryId);

      images.forEach((image) => {
        submitData.append("images", image);
      });

      if (!id) throw new Error("Product ID missing");
      
      await updateProduct(id, submitData);
      navigate("/admin/products");
    } catch (err: any) {
      setError(err?.message || "Failed to edit product");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Edit Product</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Modify the details and inventory of this product.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate("/admin/products")}>
                Back to Products
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

        <Card className="border-0 shadow-lg shadow-slate-100">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    list="brand-options"
                    value={formData.brand}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("brand", e.target.value)}
                    placeholder="Enter or select product brand"
                    required
                  />
                  <datalist id="brand-options">
                    {existingBrands.map((brand, i) => (
                      <option key={i} value={brand} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={(value: string) => handleInputChange("categoryId", value)} disabled={categoriesLoading}>
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
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("quantity", e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Product Images (Upload new to replace)</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {images.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {images.length} file(s) selected
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
