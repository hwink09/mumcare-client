import { BrowserRouter as Router, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ChatPopup } from "@/components/ChatPopup";
import { useAuth, useCart } from "@/hooks/useAuth";
import {
  AdminRoutes,
  ErrorRoutes,
  GuestRoutes,
  MemberRoutes,
  PublicRoutes,
  StaffRoutes,
} from "@/routes";
import { createRouteHandlers } from "@/routes/createRouteHandlers";
import type { AppAuthState, AppCartState, RouteGroupProps } from "@/routes/types";

function App() {
  const auth = useAuth();
  const cart = useCart({
    isLoggedIn: auth.isLoggedIn,
    ownerKey: auth.user?._id || auth.user?.id || auth.user?.email || null,
  });

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes auth={auth} cart={cart} />
    </Router>
  );
}

interface AppRoutesProps {
  auth: AppAuthState;
  cart: AppCartState;
}

function AppRoutes({ auth, cart }: AppRoutesProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const handlers = createRouteHandlers({ auth, cart, location, navigate });

  const routeProps: RouteGroupProps = {
    auth,
    cart,
    location,
    navigate,
    handlers,
  };

  return (
    <>
      <Routes>
        <PublicRoutes {...routeProps} />
        <GuestRoutes {...routeProps} />
        <MemberRoutes {...routeProps} />
        <StaffRoutes {...routeProps} />
        <AdminRoutes {...routeProps} />
        <ErrorRoutes />
      </Routes>

      {!handlers.shouldHideChatPopup ? (
        <ChatPopup user={auth.user || null} isLoggedIn={auth.isLoggedIn} />
      ) : null}
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
