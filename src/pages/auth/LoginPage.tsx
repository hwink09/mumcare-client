import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { loginUser } from "@/services/userService";
import type { CurrentUser } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/error";
import toast from "react-hot-toast";

interface LoginPageProps {
  onClose?: () => void;
  onSwitchToRegister?: () => void;
  onLoginSuccess?: (user: CurrentUser | null) => void;
  initialEmail?: string;
  initialPassword?: string;
  title?: string;
  subtitle?: string;
  showRegister?: boolean;
  redirectPath?: string | null;
}

export function LoginPage({
  onClose,
  onSwitchToRegister,
  onLoginSuccess,
  initialEmail = "",
  initialPassword = "",
  title = "Welcome back to MumCare",
  subtitle = "Sign in to track orders, keep your cart in sync, and continue shopping with your member benefits.",
  showRegister = true,
  redirectPath,
}: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpenRegister = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
      return;
    }

    navigate("/register");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      const loggedInUser = (result as { data?: CurrentUser; user?: CurrentUser })?.data
        || (result as { user?: CurrentUser })?.user
        || (result as CurrentUser);
      const role = (loggedInUser as { role?: string })?.role;

      onLoginSuccess?.(loggedInUser);
      onClose?.();
      toast.success("Welcome back!");

      if (role === "staff") {
        navigate("/staff");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirectPath || "/");
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Login failed");
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      backLabel="Back to Home"
      onBack={() => navigate("/")}
      eyebrow="Sign In"
      title={title}
      description={subtitle}
      panelTitle="Access your MumCare account with confidence."
      panelDescription="Log in to view orders, manage rewards, and keep everyday shopping smoother for your family."
      stats={[
        { label: "Order tracking", value: "Instant" },
        { label: "Reward access", value: "Members" },
      ]}
      highlights={[
        {
          icon: Package,
          title: "Keep orders close",
          description: "See your recent purchases, delivery status, and past order details in one place.",
        },
        {
          icon: Gift,
          title: "Use your benefits",
          description: "Apply rewards and vouchers faster whenever you are ready to check out again.",
        },
        {
          icon: ShieldCheck,
          title: "Secure member access",
          description: "Your account stays focused on safe login, order tracking, and reward access without extra clutter.",
        },
      ]}
    >
      <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm"
        >
          Login
        </button>
        {showRegister ? (
          <button
            type="button"
            onClick={handleOpenRegister}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Register
          </button>
        ) : null}
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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

        <AuthField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
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

        <div className="flex justify-end text-sm text-slate-600">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="font-semibold text-slate-700 transition hover:text-pink-600"
          >
            Forgot password?
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-900"
        >
          {loading ? "Logging in..." : "Login to MumCare"}
        </Button>
      </form>

      {showRegister ? (
        <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          New to MumCare?
          <button
            type="button"
            onClick={handleOpenRegister}
            className="ml-2 font-semibold text-slate-900 transition hover:text-pink-600"
          >
            Create your account
          </button>
        </div>
      ) : null}
    </AuthShell>
  );
}
