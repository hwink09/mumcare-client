import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth, useCart } from "@/hooks/useAuth";
import { MainLayout } from "@/layouts/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ProfilePage } from "@/pages/member/ProfilePage";
import { ContactPage } from "@/pages/Contact";
import { AboutPage } from "@/pages/About";

function App() {
  const auth = useAuth();
  const cart = useCart();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout auth={auth} cart={cart} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onClose={() => window.history.back()}
              onSwitchToRegister={() => window.location.href = "/register"}
              onLoginSuccess={auth.onLoggedIn}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              onClose={() => window.history.back()}
              onSwitchToLogin={() => window.location.href = "/login"}
            />
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/contact"
          element={
            <ContactPage
              onNavigate={(page) => {
                if (page === "home") window.location.href = "/";
                else if (page === "products") window.location.href = "/?section=products";
              }}
              onCartClick={() => window.location.href = "/cart"}
              onLoginClick={() => window.location.href = "/login"}
              onRegisterClick={() => window.location.href = "/register"}
              isLoggedIn={auth.isLoggedIn}
              user={auth.user || undefined}
              onLogout={auth.onLogout}
              cartItemCount={cart.items.length}
            />
          }
        />
        <Route
          path="/about"
          element={
            <AboutPage
              onNavigate={(page) => {
                if (page === "home") window.location.href = "/";
                else if (page === "products") window.location.href = "/?section=products";
                else if (page === "contact") window.location.href = "/contact";
              }}
              onCartClick={() => window.location.href = "/cart"}
              onLoginClick={() => window.location.href = "/login"}
              onRegisterClick={() => window.location.href = "/register"}
              isLoggedIn={auth.isLoggedIn}
              user={auth.user || undefined}
              onLogout={auth.onLogout}
              cartItemCount={cart.items.length}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
