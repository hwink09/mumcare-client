import type { CurrentUser, CartItem } from "@/hooks/useAuth";
import type { Product } from "@/types/product";
import type { Location, NavigateFunction } from "react-router-dom";

export interface AppAuthState {
  isLoggedIn: boolean;
  user: CurrentUser | null;
  loading: boolean;
  onLoggedIn: (loggedInUser?: CurrentUser | null) => Promise<void>;
  onLogout: () => Promise<void>;
}

export interface AppCartState {
  items: CartItem[];
  cartItemCount: number;
  addToCart: (product: Product) => boolean;
  updateQuantity: (productId: string, quantity: number) => boolean;
  removeItem: (productId: string) => boolean;
  clearCart: () => boolean;
}

export interface RouteHandlers {
  redirectTo: string | null;
  shouldHideChatPopup: boolean;
  goToLogin: (targetPath: string) => void;
  handleAddToCart: (product: Product) => boolean;
  handleCartAccess: () => boolean;
  navigateByPage: (page: string) => void;
}

export interface RouteGroupProps {
  auth: AppAuthState;
  cart: AppCartState;
  location: Location;
  navigate: NavigateFunction;
  handlers: RouteHandlers;
}
