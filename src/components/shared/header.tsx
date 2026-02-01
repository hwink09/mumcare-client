import { useState } from "react";
import { Baby, Search, Bell } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Input } from "../forms/input";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  userPoints?: number;
  onNavigate: (page: string) => void;
}

export function Header({
  cartItemCount,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  userPoints = 0,
  onNavigate,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-3 flex-shrink-0"
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
          </button>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products, articles, tips..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications - Logged In */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden sm:flex"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
                </Badge>
              </Button>
            )}

            <div className="hidden sm:flex gap-2">
              <Button variant="ghost" onClick={onLoginClick}>
                Login
              </Button>
              <Button onClick={onRegisterClick}>Register</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-t hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-3">
            <button
              onClick={() => onNavigate("home")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("products")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => onNavigate("articles")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Health Tips
            </button>
            <button
              onClick={() => onNavigate("preorder")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pre-Order
            </button>
            <button
              onClick={() => onNavigate("about")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
