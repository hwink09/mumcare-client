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
  admin_dashboard: "/admin",
  admin_users: "/admin/users",
  admin_products: "/admin/products",
  admin_orders: "/admin/orders",
  admin_categories: "/admin/categories",
  admin_blogs: "/admin/blogs",
  admin_vouchers: "/admin/vouchers",
  staff_dashboard: "/staff",
  staff_orders: "/staff/orders",
  staff_inventory: "/staff/inventory",
  staff_blogs: "/staff/blogs",
  staff_vouchers: "/staff/vouchers",
  "staff-login": "/staff",
  preorder: "/products",
};

export function resolvePageRoute(page: string): string {
  return PAGE_ROUTES[page] ?? "/";
}
