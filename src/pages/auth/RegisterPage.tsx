import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { getErrorMessage } from "@/lib/error";
import { registerUser } from "@/services/userService";
import toast from "react-hot-toast";

interface RegisterPageProps {
  onClose?: () => void;
  onSwitchToLogin?: () => void;
}

export function RegisterPage({ onClose, onSwitchToLogin }: RegisterPageProps) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpenLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
      return;
    }

    navigate("/login");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!agreeTerms) {
      const msg = "Please agree to the Terms of Service and Privacy Policy.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!firstName || !lastName) {
      const msg = "First name and last name are required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      toast.success("Account created successfully!");

      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else if (onClose) {
        onClose();
      } else {
        navigate("/login");
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Registration failed");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      backLabel="Back to Home"
      onBack={() => navigate("/")}
      eyebrow="Create Account"
      title="Join MumCare today"
      description="Create your account to save orders, access rewards, and enjoy a smoother shopping experience."
      panelTitle="Start your MumCare membership in a few simple steps."
      panelDescription="Register once and keep your essentials, support, and order history in one warm, easy-to-use space."
      stats={[
        { label: "Member rewards", value: "Ready" },
        { label: "Checkout speed", value: "Faster" },
      ]}
      highlights={[
        {
          icon: Gift,
          title: "Unlock loyalty benefits",
          description: "Earn and use member perks while shopping for baby care and family essentials.",
        },
        {
          icon: User,
          title: "Save your account details",
          description: "Keep your profile, order history, and future purchases connected to one account.",
        },
        {
          icon: ShieldCheck,
          title: "Register securely",
          description: "Create your account with a secure password and simple details to get started quickly.",
        },
      ]}
    >
      <div className="mb-6 inline-flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={handleOpenLogin}
          className="rounded-full px-5 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Login
        </button>
        <button
          type="button"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 shadow-sm"
        >
          Register
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            label="First Name"
            icon={User}
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Jane"
            autoComplete="given-name"
            required
          />
          <AuthField
            label="Last Name"
            icon={User}
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>

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
          label="Phone Number"
          icon={Phone}
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+84 123 456 789"
          autoComplete="tel"
        />

        <AuthField
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
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
          placeholder="Confirm your password"
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

        <label className="flex items-start gap-3 rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(event) => setAgreeTerms(event.target.checked)}
            className="mt-0.5 size-4 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
          />
          <span>
            I agree to the Terms of Service and Privacy Policy, and I want to create my MumCare account.
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-900"
        >
          {loading ? "Creating account..." : "Create MumCare account"}
        </Button>
      </form>

      <div className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
        Already have an account?
        <button
          type="button"
          onClick={handleOpenLogin}
          className="ml-2 font-semibold text-slate-900 transition hover:text-pink-600"
        >
          Sign in here
        </button>
      </div>
    </AuthShell>
  );
}
