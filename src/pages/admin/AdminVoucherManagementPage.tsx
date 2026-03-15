import { useEffect, useState } from "react";
import { Copy, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentUser } from "@/hooks/useAuth";
import couponService from "@/services/couponService";

type Voucher = {
  _id: string;
  name: string;
  discount: number;
  expiry: string | Date;
  status: string;
};

interface AdminVoucherManagementPageProps {
  user?: CurrentUser | null;
  onLogout: () => void;
  isEmbedded?: boolean;
}

export function AdminVoucherManagementPage({ isEmbedded = false }: AdminVoucherManagementPageProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", discount: 0, expiry: 30 }); // Default expiry 30 days
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await couponService.getAll();
      setVouchers(Array.isArray(res) ? res : res.data || []);
    } catch {
      setError("Failed to load vouchers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleEditClick = (v: Voucher) => {
    setIsEditing(v._id);
    setIsCreating(false);
    
    // expiry is usually a date string from server, calculate approx days from now
    const expires = new Date(v.expiry);
    const now = new Date();
    const diffTime = Math.abs(expires.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setFormData({ name: v.name, discount: v.discount, expiry: diffDays });
    setFormError(null);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setIsEditing(null);
    setFormData({ name: "", discount: 10, expiry: 7 });
    setFormError(null);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setIsEditing(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!formData.name.trim()) {
      setFormError("Voucher code cannot be empty.");
      return;
    }
    if (formData.discount <= 0 || formData.discount >= 100) {
      setFormError("Discount must be between 1 and 99 percentage.");
      return;
    }
    if (formData.expiry <= 0) {
      setFormError("Expiry must be at least 1 day.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await couponService.update(isEditing, {
            name: formData.name.trim().toUpperCase(),
            discount: Number(formData.discount),
            expiry: Number(formData.expiry),
        });
      } else {
        await couponService.create({
            name: formData.name.trim().toUpperCase(),
            discount: Number(formData.discount),
            expiry: Number(formData.expiry),
        });
      }

      await loadVouchers();
      setIsCreating(false);
      setIsEditing(null);
    } catch (err: any) {
      setFormError(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await couponService.delete(id);
      await loadVouchers();
    } catch {
      setError("Failed to delete voucher.");
    }
  };

  const wrapContent = (content: React.ReactNode) => {
    if (isEmbedded) {
      return (
        <Card className="border-0 shadow-lg shadow-slate-100 mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Voucher Management</CardTitle>
            {!isCreating && !isEditing && (
              <Button onClick={handleCreateClick} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Voucher
              </Button>
            )}
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Vouchers</h1>
            {!isCreating && !isEditing && (
              <Button onClick={handleCreateClick} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Voucher
              </Button>
            )}
          </div>
          <Card className="border-0 shadow-lg shadow-slate-100">
            <CardContent className="pt-6">{content}</CardContent>
          </Card>
        </div>
      </div>
    );
  };

  let content = null;

  if (loading) {
    content = <div className="text-center py-10 text-muted-foreground">Loading vouchers...</div>;
  } else if (error) {
    content = <div className="text-center py-10 text-rose-500">{error}</div>;
  } else if (isCreating || isEditing) {
    content = (
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {formError && <div className="bg-rose-50 text-rose-600 px-3 py-2 rounded text-sm">{formError}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Voucher Code</label>
          <input
            className="w-full border rounded px-3 py-2 uppercase"
            placeholder="e.g. SUMMER20"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            min="1"
            max="99"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valid for (days from now)</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            min="1"
            value={formData.expiry}
            onChange={(e) => setFormData({ ...formData, expiry: Number(e.target.value) })}
            required
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleCancelForm} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Voucher"}
          </Button>
        </div>
      </form>
    );
  } else if (vouchers.length === 0) {
    content = <div className="text-center py-10 text-muted-foreground">No vouchers found. Click &quot;Add Voucher&quot; to create one.</div>;
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left align-middle border-collapse">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500 font-medium">
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {vouchers.map((v) => {
              const isExpired = new Date(v.expiry) < new Date();
              return (
                <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 group relative truncate max-w-37.5">
                    {v.name}
                    <button
                        className="ml-2 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => navigator.clipboard.writeText(v.name)}
                        title="Copy Code"
                    >
                        <Copy className="h-3 w-3 inline" />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">{v.discount}% Off</td>
                  <td className="py-3 px-4">
                    {new Date(v.expiry).toLocaleDateString()}
                    {isExpired && <span className="ml-2 text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full inline-block">Expired</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(v)} className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600">
                            <span className="sr-only">Edit</span>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(v._id)} className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                            <span className="sr-only">Delete</span>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return wrapContent(content);
}

export default AdminVoucherManagementPage;
