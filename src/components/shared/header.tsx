import {
  Baby,
  ChevronRight,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { resolvePageRoute } from "@/lib/pageRoutes";
import { cn } from "@/lib/utils";

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

const navItems = [
  { label: "Home", value: "home" },
  { label: "Products", value: "products" },
  { label: "Blogs", value: "blogs" },
  { label: "About Us", value: "about" },
  { label: "Contact", value: "contact" },
];

const topHighlights = [
  { icon: Sparkles, text: "Curated essentials for moms and babies" },
  { icon: Truck, text: "Free shipping from 500.000 d" },
  { icon: ShieldCheck, text: "Trusted quality from verified brands" },
];

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
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName = fullName || user?.email?.split("@")[0] || "User";

  const isNavItemActive = (page: string) => {
    const targetPath = resolvePageRoute(page);
    if (targetPath === "/") return pathname === "/";
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const params = new URLSearchParams();
    params.set("search", trimmed);
    navigate(`/products?${params.toString()}`);
    closeMobileMenu();
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    closeMobileMenu();
  };

  const handleCartClick = () => {
    onCartClick();
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 shadow-[0_20px_70px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="h-px w-full bg-gradient-to-r from-pink-400 via-sky-400 to-emerald-300" />

      <div className="hidden lg:block border-b border-slate-200/70 bg-[linear-gradient(90deg,rgba(252,231,243,0.65),rgba(255,255,255,0.92),rgba(219,234,254,0.72))]">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm ring-1 ring-white/70">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
            <span>MumCare picks for every stage of motherhood</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {topHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-white/80"
                >
                  <Icon className="h-3.5 w-3.5 text-sky-600" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 lg:gap-5">
          <Button
            variant="ghost"
            onClick={() => handleNavigate("home")}
            className="group h-auto rounded-[26px] border border-slate-200/80 bg-white/80 px-2 py-2 shadow-sm hover:bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-400 to-sky-500 text-white shadow-lg shadow-pink-200/70 transition-transform duration-300 group-hover:scale-105">
                <Baby className="h-6 w-6" />
              </div>
              <div className="hidden text-left sm:block">
                <div className="bg-gradient-to-r from-slate-900 via-pink-700 to-sky-700 bg-clip-text text-xl font-black tracking-tight text-transparent">
                  MumCare
                </div>
                <div className="text-xs font-medium text-slate-500">
                  Thoughtful care for mom and baby
                </div>
              </div>
            </div>
          </Button>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 items-center gap-3 rounded-full border border-slate-200/80 bg-white/88 px-4 py-2 shadow-sm ring-1 ring-white/70"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formula, diapers, care essentials..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <Button
              type="submit"
              className="h-10 rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800"
            >
              Search
            </Button>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                className="hidden xl:inline-flex h-11 rounded-full border border-amber-100 bg-amber-50/80 px-4 text-amber-700 hover:bg-amber-100"
                onClick={() => handleNavigate("loyalty")}
              >
                <Gift className="h-4 w-4" />
                Loyalty Rewards
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="hidden xl:inline-flex h-11 rounded-full border border-sky-100 bg-sky-50/80 px-4 text-sky-700 hover:bg-sky-100"
                onClick={() => handleNavigate("blogs")}
              >
                <Sparkles className="h-4 w-4" />
                Parenting Tips
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleCartClick}
              className="relative h-11 rounded-full border-slate-200 bg-white/88 px-3 shadow-sm hover:bg-white"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span className="hidden text-sm font-semibold sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-1 text-[11px] text-white shadow-sm">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <DropdownMenu
                  align="end"
                  trigger={
                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-slate-200 bg-white/88 px-3 shadow-sm hover:bg-white"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-sky-500 text-sm font-bold text-white">
                        {userInitial}
                      </div>
                      <div className="hidden text-left lg:block">
                        <div className="text-sm font-semibold text-slate-800">{userName}</div>
                        <div className="text-[11px] text-slate-500">
                          {user?.role === "admin" ? "Admin account" : "Member account"}
                        </div>
                      </div>
                    </Button>
                  }
                >
                  <DropdownMenuItem onClick={() => onNavigate("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("orders")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("reviews")}>
                    <Star className="mr-2 h-4 w-4" />
                    My Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate("loyalty")}>
                    <Gift className="mr-2 h-4 w-4" />
                    Loyalty & Vouchers
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onNavigate("admin_dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="h-11 rounded-full px-4 text-slate-600 hover:bg-slate-100"
                    onClick={onLoginClick}
                  >
                    Login
                  </Button>
                  <Button
                    className="h-11 rounded-full bg-gradient-to-r from-pink-500 to-sky-500 px-5 text-white shadow-lg shadow-pink-200/60 hover:from-pink-600 hover:to-sky-600"
                    onClick={onRegisterClick}
                  >
                    Join MumCare
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-11 w-11 rounded-full border border-slate-200 bg-white/88 shadow-sm hover:bg-white"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="hidden md:block py-4">
          <nav className="rounded-full border border-slate-200/80 bg-white/76 p-1.5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-center gap-1 lg:gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  onClick={() => handleNavigate(item.value)}
                  className={cn(
                    "h-11 rounded-full px-4 text-sm font-semibold transition-all lg:px-5",
                    isNavItemActive(item.value)
                      ? "bg-gradient-to-r from-pink-500 to-sky-500 text-white shadow-md shadow-pink-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/70 bg-white/96 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="container mx-auto space-y-4 px-4 py-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <Button type="submit" className="h-9 rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800">
                Go
              </Button>
            </form>

            {isLoggedIn && (
              <div className="rounded-3xl bg-gradient-to-r from-pink-500 to-sky-500 p-[1px] shadow-lg shadow-pink-100/70">
                <div className="flex items-center gap-3 rounded-[calc(1.5rem-1px)] bg-white px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-sky-500 text-sm font-bold text-white">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-900">{userName}</div>
                    <div className="text-xs text-slate-500">
                      {user?.role === "admin" ? "Admin account" : "Shopping with your member account"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.value}
                  variant="ghost"
                  onClick={() => handleNavigate(item.value)}
                  className={cn(
                    "h-12 justify-start rounded-2xl px-4 text-base",
                    isNavItemActive(item.value)
                      ? "bg-gradient-to-r from-pink-500 to-sky-500 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              {isLoggedIn ? (
                <>
                  <Button variant="ghost" className="h-11 justify-start rounded-2xl px-4" onClick={() => handleNavigate("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                  <Button variant="ghost" className="h-11 justify-start rounded-2xl px-4" onClick={() => handleNavigate("orders")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                  <Button variant="ghost" className="h-11 justify-start rounded-2xl px-4" onClick={() => handleNavigate("reviews")}>
                    <Star className="mr-2 h-4 w-4" />
                    My Reviews
                  </Button>
                  <Button variant="ghost" className="h-11 justify-start rounded-2xl px-4" onClick={() => handleNavigate("loyalty")}>
                    <Gift className="mr-2 h-4 w-4" />
                    Loyalty & Vouchers
                  </Button>

                  {user?.role === "admin" && (
                    <Button
                      variant="ghost"
                      className="h-11 justify-start rounded-2xl px-4"
                      onClick={() => handleNavigate("admin_dashboard")}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="mt-1 h-11 justify-start rounded-2xl px-4 text-rose-600 hover:text-rose-700"
                    onClick={() => {
                      onLogout?.();
                      closeMobileMenu();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="h-11 rounded-2xl"
                    onClick={() => {
                      onLoginClick();
                      closeMobileMenu();
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="h-11 rounded-2xl bg-gradient-to-r from-pink-500 to-sky-500 text-white hover:from-pink-600 hover:to-sky-600"
                    onClick={() => {
                      onRegisterClick();
                      closeMobileMenu();
                    }}
                  >
                    Create Account
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
