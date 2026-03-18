import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, updateProfile } from "@/services/userService";
import type { CurrentUser } from "@/hooks/useAuth";

interface ProfilePageProps {
  initialUser?: CurrentUser | null;
}

const getRoleLabel = (role?: string) => {
  if (role === "admin") return "Administrator";
  if (role === "staff") return "Staff Member";
  return "MumCare Member";
};

const getRoleBadgeClassName = (role?: string) => {
  if (role === "admin") return "bg-amber-50 text-amber-700 border-amber-200";
  if (role === "staff") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-pink-50 text-pink-700 border-pink-200";
};

export function ProfilePage({ initialUser }: ProfilePageProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [firstName, setFirstName] = useState(initialUser?.firstName || "");
  const [lastName, setLastName] = useState(initialUser?.lastName || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");

  useEffect(() => {
    const hasInitialUser = Boolean(initialUser && (initialUser._id || initialUser.id || initialUser.email));

    if (hasInitialUser) {
      setUser(initialUser ?? null);
      setFirstName(initialUser?.firstName || "");
      setLastName(initialUser?.lastName || "");
      setPhone(initialUser?.phone || "");
      setLoadError("");
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUser();
        const loadedUser = ((data as { user?: CurrentUser })?.user || data) as CurrentUser;
        setUser(loadedUser);
        setFirstName(loadedUser?.firstName || "");
        setLastName(loadedUser?.lastName || "");
        setPhone(loadedUser?.phone || "");
        setLoadError("");
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load profile.");
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
      setSaveError("");
      setSuccessMessage("");

      const updatedResponse = await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      const updatedUser = (
        (updatedResponse as { user?: CurrentUser; data?: CurrentUser })?.user
        || (updatedResponse as { data?: CurrentUser })?.data
        || updatedResponse
      ) as CurrentUser;

      const mergedUser: CurrentUser = {
        ...(user || {}),
        ...(updatedUser || {}),
        firstName: updatedUser?.firstName ?? firstName.trim(),
        lastName: updatedUser?.lastName ?? lastName.trim(),
        phone: updatedUser?.phone ?? phone.trim(),
      };

      setUser(mergedUser);
      setFirstName(mergedUser.firstName || "");
      setLastName(mergedUser.lastName || "");
      setPhone(mergedUser.phone || "");
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const fullName = useMemo(() => {
    const nextName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ").trim();
    return nextName || user?.email?.split("@")[0] || "MumCare User";
  }, [firstName, lastName, user?.email]);

  const userInitial = useMemo(
    () => firstName?.trim()?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U",
    [firstName, user?.email],
  );

  const accountId = user?._id || user?.id || "Unavailable";

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_30%,rgba(239,246,255,0.88)_100%)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500" />
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loadError && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_30%,rgba(239,246,255,0.88)_100%)] px-4">
        <Card className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white/90 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.45)]">
          <CardContent className="p-8 text-center">
            <div className="mx-auto inline-flex rounded-2xl bg-red-50 p-3 text-red-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-black text-slate-950">Unable to open your profile</h1>
            <p className="mt-3 text-base leading-8 text-slate-600">{loadError}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => navigate("/login")}
                className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
              >
                Go to login
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(253,242,248,0.68),rgba(255,255,255,1)_22%,rgba(239,246,255,0.88)_100%)]">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm hover:bg-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-6">
            <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] text-3xl font-black text-white shadow-lg shadow-pink-100">
                    {userInitial}
                  </div>
                  <div>
                    <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeClassName(user?.role)}`}>
                      {getRoleLabel(user?.role)}
                    </div>
                    <h2 className="mt-3 text-3xl font-black text-slate-950">{fullName}</h2>
                    <p className="mt-1 text-sm text-slate-500">{user?.email || "No email available"}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email</p>
                      <p className="mt-1 font-medium text-slate-900">{user?.email || "Not provided"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-pink-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone</p>
                      <p className="mt-1 font-medium text-slate-900">{phone.trim() || "Add your phone number"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <User className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Account ID</p>
                      <p className="mt-1 break-all font-mono text-sm text-slate-900">{accountId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Personal Details</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Edit your information</h2>
              <p className="mt-3 text-base leading-8 text-slate-600">
                Keep your name and phone number up to date so your account stays accurate for future orders.
              </p>

              {successMessage ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}
              {saveError ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">First Name</label>
                  <input
                    className={inputClassName}
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Last Name</label>
                  <input
                    className={inputClassName}
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                  <input
                    className={`${inputClassName} cursor-not-allowed bg-slate-100 text-slate-500`}
                    value={user?.email || ""}
                    readOnly
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
                  <input
                    className={inputClassName}
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-slate-100 bg-slate-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                  <div>
                    <h3 className="font-black text-slate-900">Account note</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Your email is managed as the primary login credential. You can update your profile name and phone here without changing sign-in access.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900"
                >
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
