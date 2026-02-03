import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/services/userService";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUser();
        setUser(data?.user ?? data);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, []);

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
  const fullName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split("@")[0] || "User";

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
                {user?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-base">{user.phone}</p>
                    </div>
                  </div>
                )}

                {/* First Name */}
                {user?.firstName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">First Name</p>
                      <p className="text-base">{user.firstName}</p>
                    </div>
                  </div>
                )}

                {/* Last Name */}
                {user?.lastName && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                      <p className="text-base">{user.lastName}</p>
                    </div>
                  </div>
                )}

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
