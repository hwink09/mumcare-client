import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import authService from "@/services/userService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(email.trim());
      setSuccess(
        (result as { message?: string })?.message
          || "If this email exists, a password reset link has been sent.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      backLabel="Back to Home"
      onBack={() => navigate("/")}
      eyebrow="Password Recovery"
      title="Forgot your password?"
      description="Enter your email and we will help you get back into your MumCare account."
      panelTitle="Recover your account without the stress."
      panelDescription="Use the email linked to your account and we will send a secure reset link so you can create a new password."
      formWrapperClassName="lg:max-w-[560px] lg:justify-self-end"
      stats={[
        { label: "Recovery steps", value: "Simple" },
        { label: "Security", value: "Protected" },
      ]}
      highlights={[
        {
          icon: Mail,
          title: "Enter your email",
          description: "Start with the same email address you used when creating your MumCare account.",
        },
        {
          icon: ShieldCheck,
          title: "Check your reset link",
          description: "We will send secure instructions to help you create a new password safely.",
        },
        {
          icon: Sparkles,
          title: "Return to shopping",
          description: "Once reset, you can sign in again and continue with orders, rewards, and saved essentials.",
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
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
          {loading ? "Sending..." : "Send reset link"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/login")}
          className="h-12 w-full rounded-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
        >
          Back to login
        </Button>
      </form>
    </AuthShell>
  );
}
