import { useNavigate } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import type { CurrentUser } from "@/hooks/useAuth";

interface StaffLoginPageProps {
  onLoginSuccess?: (user: CurrentUser | null) => void;
}

export function StaffLoginPage({ onLoginSuccess }: StaffLoginPageProps) {
  const navigate = useNavigate();

  const handleLoginSuccess = async (user: CurrentUser | null) => {
    if (onLoginSuccess) {
      await onLoginSuccess(user);
    }

    // Redirect staff to dashboard when login succeeds
    navigate("/staff");
  };

  return (
    <LoginPage
      initialEmail="staff@gmail.com"
      initialPassword="1"
      title="Staff Login"
      subtitle="Use staff credentials to access the operations dashboard."
      showRegister={false}
      redirectPath="/staff"
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
