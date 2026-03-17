export const PAGE_ROUTES: Record<string, string> = {
  home: "/",
  products: "/products",
  blogs: "/blogs",
  about: "/about",
  contact: "/contact",
  cart: "/cart",
  profile: "/profile",
  orders: "/orders",
  reviews: "/reviews",
  loyalty: "/loyalty",
  coupons: "/coupons",
  client_create_blog: "/blogs/create",
  admin_dashboard: "/admin/dashboard",
  admin_blogs: "/admin/blogs",
  "staff-login": "/staff",
  preorder: "/products",
};

export function resolvePageRoute(page: string): string {
  return PAGE_ROUTES[page] ?? "/";
}
