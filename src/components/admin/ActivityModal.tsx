import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { getUsers } from "@/services/userService";

export function ActivityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await getUsers({ sort: "-updatedAt", limit: 10 });
        const normalized = (Array.isArray(data) ? data : data || []).map((user: any) => ({
          ...user,
          role: user.role === "guest" ? "client" : user.role,
        }));
        setRecentActivity(normalized);
      } catch (err: any) {
        setError(err?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[90vw] max-w-3xl rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent account activity</h2>
            <p className="text-sm text-muted-foreground">Showing latest updates across user accounts.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Loading activity...</div>
        ) : error ? (
          <div className="py-10 text-center text-red-600">{error}</div>
        ) : recentActivity.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No recent activity available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentActivity.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.role || "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
