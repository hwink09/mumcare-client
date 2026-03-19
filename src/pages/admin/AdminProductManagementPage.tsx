import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CurrentUser } from "@/hooks/useAuth";
import { formatVND } from "@/lib/currency";
import { getErrorMessage } from "@/lib/error";
import {
  deleteProduct,
  getCategories,
  getProductById,
  getProducts,
  updateProduct,
} from "@/services/productService";
import toast from "react-hot-toast";

type AdminProductManagementPageProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  isEmbedded?: boolean;
};

type ProductRow = {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
  categoryId?: string;
};

type Category = {
  _id: string;
  title: string;
};

type ProductFormData = {
  title: string;
  description: string;
  brand: string;
  price: string;
  quantity: string;
  categoryId: string;
};

const EMPTY_PRODUCT_FORM: ProductFormData = {
  title: "",
  description: "",
  brand: "",
  price: "",
  quantity: "",
  categoryId: "",
};

export function AdminProductManagementPage({
  user,
  onLogout,
  isEmbedded,
}: AdminProductManagementPageProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<ProductRow | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [existingBrands, setExistingBrands] = useState<string[]>([]);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<ProductFormData>(EMPTY_PRODUCT_FORM);
  const [editImages, setEditImages] = useState<File[]>([]);

  const isAdmin = useMemo(() => user?.role === "admin", [user]);
  const isEditDialogOpen = Boolean(editingProductId);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      navigate("/");
      return;
    }
  }, [user, isAdmin, navigate]);

  const loadProducts = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getProducts({
        limit: 100,
      });
      setProducts(Array.isArray(data) ? data : data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await getProducts({ limit: 1000 });
      const productsList = Array.isArray(data) ? data : data?.products || [];
      const uniqueBrands = Array.from(
        new Set(productsList.map((product: any) => product.brand).filter(Boolean)),
      ) as string[];
      setExistingBrands(uniqueBrands);
    } catch (err) {
      console.error("Failed to load brands:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadCategories();
      loadBrands();
    }
  }, [isAdmin]);

  const resetEditDialog = () => {
    setEditingProductId(null);
    setEditLoading(false);
    setEditSubmitting(false);
    setEditError(null);
    setEditFormData(EMPTY_PRODUCT_FORM);
    setEditImages([]);
  };

  const openDeleteDialog = (product: ProductRow) => {
    setProductPendingDelete(product);
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setProductPendingDelete(null);
  };

  const handleDelete = async () => {
    if (!productPendingDelete) return;

    setDeleteSubmitting(true);
    try {
      await deleteProduct(productPendingDelete._id);
      await loadProducts();
      toast.success(`Deleted "${productPendingDelete.title}" successfully.`);
      setProductPendingDelete(null);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to delete product");
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const openEditDialog = async (productId: string) => {
    setEditingProductId(productId);
    setEditLoading(true);
    setEditError(null);
    setEditImages([]);

    try {
      const product = await getProductById(productId);
      setEditFormData({
        title: product.title || product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        price: product.price?.toString() || "",
        quantity: product.quantity?.toString() || "",
        categoryId: product.categoryId || product.category || "",
      });
    } catch (err: any) {
      setEditError(err?.message || "Failed to load product details.");
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditDialog = () => {
    if (editSubmitting) return;
    resetEditDialog();
  };

  const handleEditInputChange = (field: keyof ProductFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setEditImages(files);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingProductId) return;

    setEditError(null);
    setEditSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", editFormData.title);
      submitData.append("description", editFormData.description);
      submitData.append("brand", editFormData.brand);
      submitData.append("price", editFormData.price);
      submitData.append("quantity", editFormData.quantity);
      submitData.append("categoryId", editFormData.categoryId);

      editImages.forEach((image) => {
        submitData.append("images", image);
      });

      await updateProduct(editingProductId, submitData);
      await loadProducts();
      await loadBrands();
      toast.success("Product updated successfully!");
      resetEditDialog();
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update product");
      setEditError(msg);
      toast.error(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  const content = (
    <>
      <Card className="border-0 shadow-lg shadow-slate-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Products</CardTitle>
            <Button onClick={() => navigate("/admin/products/create")}>
              Create Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div />
            <Button variant="outline" onClick={loadProducts}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading products...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Sold
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{product.title}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatVND(product.price || 0)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{product.sold}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(product._id)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteDialog(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          {editLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading product details...</div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-product-title">Product Title</Label>
                <Input
                  id="edit-product-title"
                  value={editFormData.title}
                  onChange={(event) => handleEditInputChange("title", event.target.value)}
                  placeholder="Enter product title"
                  disabled={editSubmitting}
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-brand">Brand</Label>
                <Input
                  id="edit-product-brand"
                  list="edit-brand-options"
                  value={editFormData.brand}
                  onChange={(event) => handleEditInputChange("brand", event.target.value)}
                  placeholder="Enter or select product brand"
                  disabled={editSubmitting}
                  required
                />
                <datalist id="edit-brand-options">
                  {existingBrands.map((brand) => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-category">Category</Label>
                <Select
                  id="edit-product-category"
                  value={editFormData.categoryId}
                  onValueChange={(value) => handleEditInputChange("categoryId", value)}
                  disabled={categoriesLoading || editSubmitting}
                  required
                >
                  <SelectItem value="" disabled>
                    {categoriesLoading ? "Loading categories..." : "Select a category"}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-product-price">Price</Label>
                  <Input
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(event) => handleEditInputChange("price", event.target.value)}
                    placeholder="0.00"
                    disabled={editSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-product-quantity">Quantity</Label>
                  <Input
                    id="edit-product-quantity"
                    type="number"
                    value={editFormData.quantity}
                    onChange={(event) => handleEditInputChange("quantity", event.target.value)}
                    placeholder="0"
                    disabled={editSubmitting}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-description">Description</Label>
                <Textarea
                  id="edit-product-description"
                  value={editFormData.description}
                  onChange={(event) => handleEditInputChange("description", event.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  disabled={editSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-product-images">Product Images</Label>
                <Input
                  id="edit-product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditImageChange}
                  disabled={editSubmitting}
                />
                {editImages.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {editImages.length} file(s) selected
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditDialog} disabled={editSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(productPendingDelete)}
        title="Delete Product"
        description={
          productPendingDelete
            ? `Permanently delete "${productPendingDelete.title}"?`
            : "Permanently delete this product?"
        }
        confirmText={deleteSubmitting ? "Deleting..." : "Delete"}
        confirmDisabled={deleteSubmitting}
        cancelDisabled={deleteSubmitting}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </>
  );

  if (isEmbedded) return <>{content}</>;

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </Button>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Product management</h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Review, update and manage all products in the system.
            </p>
          </div>

          <Card className="border border-white/40 bg-white/70 shadow-lg shadow-indigo-200/40 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-500 font-semibold text-white">
                  {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Signed in as</div>
                  <div className="text-lg font-semibold">
                    {user?.firstName || "Admin"} {user?.lastName || ""}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-right font-medium">{user?.email || "Unknown"}</span>
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
