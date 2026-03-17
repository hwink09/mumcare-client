import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/userService";
import type { CurrentUser } from "@/hooks/useAuth";

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
  title = "Welcome to MumCare Store",
  subtitle,
  showRegister = true,
}: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      const loggedInUser = (result as any)?.data || (result as any)?.user || result;
      const role = (loggedInUser as any)?.role;

      // Cập nhật user state nếu có
      if (onLoginSuccess) {
        onLoginSuccess(loggedInUser as any);
      }
      if (onClose) {
        onClose();
      }

      // Điều hướng dựa trên role
      if (role === "staff") {
        navigate("/staff");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // HomePage cho client hoặc role khác
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm transition font-medium shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>
      
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          {subtitle ? <p className="text-sm text-muted-foreground mb-4">{subtitle}</p> : null}

          {/* Tabs */}
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-white text-black font-medium rounded-full border-2 border-gray-300">
              Login
            </button>
            {/* Chỉ cho phép đăng ký nếu không phải staff/admin */}
            {showRegister && (!email || (!email.endsWith("@gmail.com") && !email.endsWith("@admin.com"))) && (
              <button
                onClick={onSwitchToRegister}
                className="px-6 py-2 bg-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-300 transition"
              >
                Register
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-4">
          <button className="py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <text x="0" y="20" fontSize="24" fill="currentColor">G</text>
            </svg>
            Google
          </button>
        </div>
      </div>
    </div>
  );
}
