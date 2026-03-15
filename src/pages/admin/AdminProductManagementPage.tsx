import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/hooks/useAuth";
import { deleteProduct, getProducts } from "@/services/productService";

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

export function AdminProductManagementPage({ user, onLogout, isEmbedded }: AdminProductManagementPageProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isAdmin) loadProducts();
  }, [isAdmin]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Permanently delete this product?")) return;
    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || "Failed to delete product");
    }
  };

  const content = (
    <Card className="border-0 shadow-lg shadow-slate-100">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Products</CardTitle>
          <Button onClick={() => navigate('/admin/products/create')}>
            Create Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
          </div>
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
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{p.title}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">₫{p.price?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.quantity}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.sold}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(p._id)}
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
  );

  if (isEmbedded) return <>{content}</>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-slate-100 text-slate-900">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
              Admin Control Center
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Product management</h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Review, update and manage all products in the system.
            </p>
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