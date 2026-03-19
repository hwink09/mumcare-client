import { useEffect, useMemo, useState } from "react";
import { Copy, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error";
import couponService from "@/services/couponService";
import toast from "react-hot-toast";

type Voucher = {
  _id: string;
  name: string;
  discount: number;
  expiry: string | Date;
  status: string;
  pointCost?: number;
};

interface StaffVoucherManagementPageProps {
  user?: CurrentUser | null;
  onLogout?: () => void;
  isEmbedded?: boolean;
}

const DEFAULT_FORM_DATA = { name: "", discount: 10, expiry: 7, pointCost: 0 };

export function StaffVoucherManagementPage({ isEmbedded = false }: StaffVoucherManagementPageProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isFormDialogOpen = useMemo(() => isCreating || Boolean(isEditing), [isCreating, isEditing]);

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

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setFormError(null);
  };

  const handleEditClick = (voucher: Voucher) => {
    const expires = new Date(voucher.expiry);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    setIsEditing(voucher._id);
    setIsCreating(false);
    setFormData({
      name: voucher.name,
      discount: voucher.discount,
      expiry: diffDays,
      pointCost: voucher.pointCost || 0,
    });
    setFormError(null);
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setIsEditing(null);
    resetForm();
  };

  const closeFormDialog = () => {
    if (submitting) return;

    setIsCreating(false);
    setIsEditing(null);
    resetForm();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      const msg = "Voucher code cannot be empty.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (formData.discount <= 0 || formData.discount >= 100) {
      const msg = "Discount must be between 1 and 99 percentage.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (formData.expiry <= 0) {
      const msg = "Expiry must be at least 1 day.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim().toUpperCase(),
        discount: Number(formData.discount),
        expiry: Number(formData.expiry),
        pointCost: Number(formData.pointCost) || 0,
      };

      if (isEditing) {
        await couponService.update(isEditing, payload);
      } else {
        await couponService.create(payload);
      }

      await loadVouchers();
      toast.success(isEditing ? "Voucher updated successfully!" : "Voucher created successfully!");
      setIsCreating(false);
      setIsEditing(null);
      resetForm();
    } catch (err) {
      const msg = getErrorMessage(err, "Operation failed.");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const wrapContent = (content: React.ReactNode) => {
    const headerAction = (
      <Button onClick={handleCreateClick} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
        <Plus className="mr-2 h-4 w-4" />
        Add Voucher
      </Button>
    );

    if (isEmbedded) {
      return (
        <Card className="mt-4 border-0 shadow-lg shadow-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Voucher Management</CardTitle>
            {headerAction}
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Vouchers</h1>
            {headerAction}
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
    content = <div className="py-10 text-center text-muted-foreground">Loading vouchers...</div>;
  } else if (error) {
    content = <div className="py-10 text-center text-rose-500">{error}</div>;
  } else if (vouchers.length === 0) {
    content = <div className="py-10 text-center text-muted-foreground">No vouchers found. Click Add Voucher to create one.</div>;
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left align-middle text-sm">
          <thead>
            <tr className="border-b bg-slate-50 font-medium text-slate-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Expiry Date</th>
              <th className="px-4 py-3">Point Cost</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {vouchers.map((voucher) => {
              const isExpired = new Date(voucher.expiry) < new Date();
              return (
                <tr key={voucher._id} className="transition-colors hover:bg-slate-50">
                  <td className="group relative max-w-[150px] truncate px-4 py-3 font-semibold text-slate-900">
                    {voucher.name}
                    <button
                      type="button"
                      className="ml-2 text-slate-400 opacity-0 transition-opacity hover:text-indigo-600 group-hover:opacity-100"
                      onClick={() => navigator.clipboard.writeText(voucher.name)}
                      title="Copy Code"
                    >
                      <Copy className="inline h-3 w-3" />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{voucher.discount}% Off</td>
                  <td className="px-4 py-3">
                    {new Date(voucher.expiry).toLocaleDateString()}
                    {isExpired && (
                      <span className="ml-2 inline-block rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-500">
                        Expired
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-amber-600">
                    {voucher.pointCost ? `${voucher.pointCost} pts` : "Free"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(voucher)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                      >
                        <span className="sr-only">Edit</span>
                        <Edit className="h-4 w-4" />
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

  return wrapContent(
    <>
      {content}

      <Dialog open={isFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Voucher" : "Create Voucher"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="voucher-name">Voucher Code</Label>
              <Input
                id="voucher-name"
                className="uppercase"
                placeholder="e.g. SUMMER20"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                disabled={submitting}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-discount">Discount (%)</Label>
              <Input
                id="voucher-discount"
                type="number"
                min="1"
                max="99"
                value={formData.discount}
                onChange={(event) => setFormData((prev) => ({ ...prev, discount: Number(event.target.value) }))}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-expiry">Valid For (days from now)</Label>
              <Input
                id="voucher-expiry"
                type="number"
                min="1"
                value={formData.expiry}
                onChange={(event) => setFormData((prev) => ({ ...prev, expiry: Number(event.target.value) }))}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher-points">Exchange Points Cost</Label>
              <Input
                id="voucher-points"
                type="number"
                min="0"
                value={formData.pointCost}
                onChange={(event) => setFormData((prev) => ({ ...prev, pointCost: Number(event.target.value) }))}
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeFormDialog} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-indigo-600 text-white hover:bg-indigo-700">
                {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Voucher"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>,
  );
}

export default StaffVoucherManagementPage;
