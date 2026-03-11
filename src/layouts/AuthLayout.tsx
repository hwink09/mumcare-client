import { useState } from "react";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { Modal } from "@/components/ui/Modal";

export function AuthLayout() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginClick = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleRegisterClick = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  return (
    <>
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={handleRegisterClick}
        />
      </Modal>
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)}>
        <RegisterPage
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={handleLoginClick}
        />
      </Modal>
    </>
  );
}
