import { Baby, Bell, User, LogOut, ShoppingBag, Gift, Search, Menu, X, PenTool, LayoutDashboard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string; role?: string };
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
  onNavigate,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user?.firstName || user?.email?.split("@")[0] || "User";

  const navItems = [
    { label: "Home", value: "home" },
    { label: "Products", value: "products" },
    { label: "Blogs", value: "blogs" },
    { label: "About Us", value: "about" },
    { label: "Contact", value: "contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    // Điều hướng tới trang products, chỉ tìm theo tên sản phẩm (search param)
    const url = new URL(window.location.href);
    url.pathname = "/products";
    url.searchParams.set("search", trimmed);
    window.location.href = url.toString();
  };

  return (
    <header className={cn("bg-background shadow-sm sticky top-0 z-50 border-b")}>
      {/* Top Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className={cn("flex items-center gap-3 shrink-0 h-auto p-0 hover:bg-transparent")}
          >
            <div className="bg-linear-to-br from-pink-500 to-blue-500 p-2 rounded-xl">
              <Baby className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-linear-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                MomCare Store
              </h1>
              <p className="text-xs text-muted-foreground">
                Care for Mom & Baby
              </p>
            </div>
          </Button>



          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Notifications */}
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

            {/* Auth Buttons - Desktop */}
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
                            "w-8 h-8 rounded-full bg-linear-to-br from-pink-500 to-blue-500",
                            "flex items-center justify-center text-white font-bold text-sm shrink-0"
                          )}
                        >
                          {userInitial}
                        </div>
                        <span className="font-semibold text-sm">{userName}</span>
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
                    <DropdownMenuItem onClick={() => onNavigate("reviews")}>
                      <Star className="h-4 w-4 mr-2" />
                      My Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("loyalty")}>
                      <Gift className="h-4 w-4 mr-2" />
                      Loyalty & Vouchers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("client_create_blog")}>
                      <PenTool className="h-4 w-4 mr-2" />
                      Create Post / Blogs
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onNavigate("admin_dashboard")}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={onLoginClick}>
                    Login
                  </Button>
                  <Button size="sm" onClick={onRegisterClick}>Register</Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="hidden md:block border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8">
            {navItems.map((item) => (
              <Button
                key={item.value}
                variant="ghost"
                onClick={() => onNavigate(item.value)}
                className="text-base font-medium hover:text-primary rounded-none border-b-2 border-transparent hover:border-primary py-4"
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
                />
              </div>
            </form>

            {/* Mobile Nav Items */}
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  onClick={() => {
                    onNavigate(item.value);
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start text-base"
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="border-t mt-4 pt-4">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => {
                      onNavigate("profile");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => {
                      onNavigate("orders");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    My Orders
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => {
                      onNavigate("reviews");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    My Reviews
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => {
                      onNavigate("client_create_blog");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Create Post / Blogs
                  </Button>
                  {user?.role === "admin" && (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start mb-2"
                        onClick={() => {
                          onNavigate("admin_dashboard");
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full mb-2"
                    onClick={onLoginClick}
                  >
                    Login
                  </Button>
                  <Button className="w-full" onClick={onRegisterClick}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
