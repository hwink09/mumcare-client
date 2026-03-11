import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, updateProfile } from "@/services/userService";
import type { CurrentUser } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  initialUser?: CurrentUser | null;
}

export function ProfilePage({ initialUser }: ProfilePageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string; role?: string; _id?: string; id?: string } | null>(initialUser ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(initialUser?.firstName || "");
  const [lastName, setLastName] = useState(initialUser?.lastName || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Nếu đã có user từ lúc login, không cần gọi API nữa
    if (initialUser && (initialUser._id || initialUser.id || initialUser.email)) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUser();
        const u = (data as any)?.user ?? data;
        setUser(u);
        setFirstName(u?.firstName || "");
        setLastName(u?.lastName || "");
        setPhone(u?.phone || "");
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, [initialUser]);

  const handleSave = async () => {
    if (!user?._id && !user?.id) return;
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      const updated = await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      const merged = { ...(user || {}), ...(updated as any) };
      setUser(merged);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-lg font-medium text-destructive mb-2">Error loading profile</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const fullName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : firstName || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className={cn("mb-6")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-500",
                    "flex items-center justify-center text-white font-bold text-2xl shrink-0"
                  )}
                >
                  {userInitial}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  {user?.role && (
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  )}
                </div>
              </div>

              {successMessage && (
                <p className="text-sm text-emerald-600">{successMessage}</p>
              )}

              <div className={cn("border-t pt-6 space-y-4")}>
                {/* Email */}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{user?.email || "Not provided"}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <input
                      className="w-full h-9 rounded-md border px-3 text-sm"
                      placeholder="Enter phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* First Name */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">First Name</p>
                    <input
                      className="w-full h-9 rounded-md border px-3 text-sm"
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                    <input
                      className="w-full h-9 rounded-md border px-3 text-sm"
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* User ID */}
                {(user?._id || user?.id) && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="text-base font-mono text-sm">{user._id || user.id}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t mt-4">
                <Button disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
