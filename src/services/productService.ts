const API_BASE_URL = "http://localhost:8017/v1";

export type GetProductsParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

const toQueryString = (params: Record<string, unknown>) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
};

export const getProducts = async (params: GetProductsParams = {}) => {
  const response = await fetch(`${API_BASE_URL}/products${toQueryString(params)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch products");
  }

  return data;
};

export const addRating = async (id: string, payload: { star: number; comment?: string }) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}/ratings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to submit rating");
  }

  return data;
};

export const getProductById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to fetch product");
  }

  return data;
};
