import { resolvePageRoute } from "@/lib/pageRoutes";
import type { AppAuthState, AppCartState, RouteHandlers } from "@/routes/types";
import type { Location, NavigateFunction } from "react-router-dom";

interface CreateRouteHandlersOptions {
  auth: AppAuthState;
  cart: AppCartState;
  location: Location;
  navigate: NavigateFunction;
}

export function createRouteHandlers({
  auth,
  cart,
  location,
  navigate,
}: CreateRouteHandlersOptions): RouteHandlers {
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo || null;
  const shouldHideChatPopup = location.pathname === "/403" || location.pathname === "/404";

  const goToLogin = (targetPath: string) => {
    navigate("/login", { state: { redirectTo: targetPath } });
  };

  const handleAddToCart = (product: Parameters<AppCartState["addToCart"]>[0]) => {
    if (!auth.isLoggedIn) {
      goToLogin(`${location.pathname}${location.search}`);
      return false;
    }

    return cart.addToCart(product);
  };

  const handleCartAccess = () => {
    if (!auth.isLoggedIn) {
      goToLogin("/cart");
      return false;
    }

    navigate("/cart");
    return true;
  };

  const navigateByPage = (page: string) => {
    if (page === "cart" && !auth.isLoggedIn) {
      goToLogin("/cart");
      return;
    }

    navigate(resolvePageRoute(page));
  };

  return {
    redirectTo,
    shouldHideChatPopup,
    goToLogin,
    handleAddToCart,
    handleCartAccess,
    navigateByPage,
  };
}
