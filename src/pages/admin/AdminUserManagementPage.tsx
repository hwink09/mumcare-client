import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CurrentUser } from "@/hooks/useAuth";
import { deleteUser, getUsers, updateUserByAdmin } from "@/services/userService";
import { ActivityModal } from "@/components/admin/ActivityModal";

type AdminUserManagementPageProps = {
  user?: CurrentUser | null;
  onLogout: () => void;
  isEmbedded?: boolean;
};

type UserRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function AdminUserManagementPage({ user, onLogout, isEmbedded }: AdminUserManagementPageProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterBlocked, setFilterBlocked] = useState<string>("");
  const [showActivity, setShowActivity] = useState(false);
  const [userPendingDelete, setUserPendingDelete] = useState<UserRow | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  const loadUsers = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getUsers({
        role: filterRole || undefined,
        isBlocked: filterBlocked === "true" ? true : filterBlocked === "false" ? false : undefined,
      });
      const normalized = (Array.isArray(data) ? data : data || []).map((user: any) => ({
        ...user,
        role: user.role === "guest" ? "client" : user.role,
      }));
      setUsers(normalized);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, filterRole, filterBlocked]);

  const handleBlockToggle = async (userId: string, isBlocked: boolean) => {
    try {
      await updateUserByAdmin(userId, { isBlocked: !isBlocked });
      await loadUsers();
    } catch (err: any) {
      setError(err?.message || "Failed to update user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserByAdmin(userId, { role: newRole });
      await loadUsers();
    } catch (err: any) {
      setError(err?.message || "Failed to update user");
    }
  };

  const openDeleteDialog = (userItem: UserRow) => {
    setUserPendingDelete(userItem);
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setUserPendingDelete(null);
  };

  const handleDelete = async () => {
    if (!userPendingDelete) return;

    setDeleteSubmitting(true);
    try {
      await deleteUser(userPendingDelete._id);
      await loadUsers();
      setUserPendingDelete(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete user");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const content = (
    <>
      <Card className="border-0 shadow-lg shadow-slate-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All roles</option>
              <option value="client">Client</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={filterBlocked}
              onChange={(e) => setFilterBlocked(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">All accounts</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
            </select>
          </div>
          <Button variant="outline" onClick={loadUsers}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading users...</div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">{error}</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={u.role || ""}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        disabled={u.role === "admin"}
                      >
                        <option value="client">Client</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={u.isBlocked ? "destructive" : "secondary"}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={u.isBlocked ? "secondary" : "destructive"}
                          onClick={() => handleBlockToggle(u._id, !!u.isBlocked)}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(u)}
                          disabled={u.role === "admin"}
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
      <ConfirmDialog
        open={Boolean(userPendingDelete)}
        title="Delete User"
        description={
          userPendingDelete
            ? `Permanently delete ${userPendingDelete.email || "this user"}?`
            : "Permanently delete this user?"
        }
        confirmText={deleteSubmitting ? "Deleting..." : "Delete"}
        confirmDisabled={deleteSubmitting}
        cancelDisabled={deleteSubmitting}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />
    </>
  );

  return (
    <div className={isEmbedded ? "" : "min-h-screen bg-linear-to-b from-indigo-50 via-white to-slate-100 text-slate-900"}>
      <div className={isEmbedded ? "" : "container mx-auto px-4 py-10"}>
        {!isEmbedded && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 shadow-sm">
                Admin Control Center
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">User management</h1>
              <p className="mt-3 text-base text-muted-foreground max-w-xl">
                Review, update and manage all users in the system.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>Back to dashboard</Button>
                <Button size="sm" variant="outline" onClick={() => setShowActivity(true)}>Review activity</Button>
              </div>
            </div>

            <Card className="border border-white/40 bg-white/70 backdrop-blur-sm shadow-lg shadow-indigo-200/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Admin Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-semibold">
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
        )}
        
        <div className={isEmbedded ? "mt-4" : ""}>
          {isEmbedded && (
            <div className="flex flex-wrap gap-2 mb-4 justify-between w-full">
               <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
               <Button size="sm" variant="outline" onClick={() => setShowActivity(true)}>Review activity</Button>
            </div>
          )}
          {content}
        </div>
      </div>
      <ActivityModal isOpen={showActivity} onClose={() => setShowActivity(false)} />
    </div>
  );
}
