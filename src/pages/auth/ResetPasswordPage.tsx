import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import authService from "@/services/userService";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword(token, password);
      setSuccess((result as { message?: string })?.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      backLabel="Back to Login"
      onBack={() => navigate("/login")}
      eyebrow="Reset Password"
      title="Create a new password"
      description="Choose a secure password to finish recovering your MumCare account."
      panelTitle="One last step and you are back in."
      panelDescription="Set a new password you can remember easily but others cannot guess, then sign in again with confidence."
      formWrapperClassName="lg:max-w-[560px] lg:justify-self-end"
      stats={[
        { label: "Recovery status", value: "Almost done" },
        { label: "Next step", value: "Login" },
      ]}
      highlights={[
        {
          icon: Lock,
          title: "Use a strong password",
          description: "Choose a password that feels unique and secure for your MumCare account.",
        },
        {
          icon: ShieldCheck,
          title: "Confirm it carefully",
          description: "Enter the same password twice to make sure your reset finishes without issues.",
        },
        {
          icon: Sparkles,
          title: "Sign back in smoothly",
          description: "After saving your new password, you can return to login and continue shopping.",
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="New Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter a new password"
          autoComplete="new-password"
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-slate-400 transition hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
        />

        <AuthField
          label="Confirm Password"
          icon={Lock}
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm the new password"
          autoComplete="new-password"
          required
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="text-slate-400 transition hover:text-slate-600"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-900"
        >
          {loading ? "Resetting..." : "Save new password"}
        </Button>
      </form>
    </AuthShell>
  );
}
