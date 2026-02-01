import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

function App() {
  const auth = useAuth();
  const cart = useCart();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
        <Route path="/login" element={<LoginPage onClose={() => window.history.back()} onSwitchToRegister={() => window.location.href = "/register"} />} />
        <Route path="/register" element={<RegisterPage onClose={() => window.history.back()} onSwitchToLogin={() => window.location.href = "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
