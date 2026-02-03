import { Baby, Bell, User, LogOut, ShoppingBag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  userPoints?: number;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function Header({
  cartItemCount,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  userPoints = 0,
  onNavigate,
  onLogout,
}: HeaderProps) {
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <header className={cn("bg-background shadow-sm sticky top-0 z-50 border-b")}>
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className={cn("flex items-center gap-3 flex-shrink-0 h-auto p-0 hover:bg-transparent")}
          >
            <div className="bg-gradient-to-br from-pink-500 to-blue-500 p-2 rounded-xl">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                MomCare Store
              </h1>
              <p className="text-xs text-muted-foreground">
                Care for Mom & Baby
              </p>
            </div>
          </Button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications - Logged In */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className={cn("relative hidden sm:flex")}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            )}

            {/* Auth Buttons */}
            <div className={cn("hidden sm:flex gap-2 items-center")}>
              {isLoggedIn ? (
                <>
                  <DropdownMenu
                    trigger={
                      <Button
                        variant="outline"
                        className={cn("flex items-center gap-2 rounded-full px-3 py-2 h-auto cursor-pointer")}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-blue-500",
                            "flex items-center justify-center text-white font-bold text-sm shrink-0"
                          )}
                        >
                          {userInitial}
                        </div>
                        <span className="font-semibold">{userName}</span>
                      </Button>
                    }
                    align="end"
                  >
                    <DropdownMenuItem onClick={() => onNavigate("profile")}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("orders")}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("loyalty")}>
                      <Gift className="h-4 w-4 mr-2" />
                      Loyalty & Vouchers
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={onLoginClick}>
                    Login
                  </Button>
                  <Button onClick={onRegisterClick}>Register</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
