export const normalizeRole = (role?: string | null) => (role || "client").trim().toLowerCase();

export const getRoleHomePath = (role?: string | null) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "staff") return "/staff";

  return "/";
};

export const getBackofficeRedirectPath = (role?: string | null) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") return "/admin";
  if (normalizedRole === "staff") return "/staff";

  return null;
};
