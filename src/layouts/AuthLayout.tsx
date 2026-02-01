import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { Modal } from "@/components/ui/Modal";
import type { useAuth } from "@/hooks/useAuth";

interface AuthLayoutProps {
  auth: ReturnType<typeof useAuth>;
}

export function AuthLayout({ auth }: AuthLayoutProps) {
  return (
    <>
      <Modal isOpen={auth.showLogin} onClose={() => auth.setShowLogin(false)}>
        <LoginPage
          onClose={() => auth.setShowLogin(false)}
          onSwitchToRegister={auth.handleRegisterClick}
        />
      </Modal>
      <Modal isOpen={auth.showRegister} onClose={() => auth.setShowRegister(false)}>
        <RegisterPage
          onClose={() => auth.setShowRegister(false)}
          onSwitchToLogin={auth.handleLoginClick}
        />
      </Modal>
    </>
  );
}
