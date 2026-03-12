const API_BASE_URL = 'http://localhost:8017/v1';

const getHeaders = (includeAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const buildQueryString = (params: Record<string, unknown>) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    usp.set(k, String(v));
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
};

export type GetProductsParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
};

const productService = {
  getAll: async (params: GetProductsParams = {}) => {
    const response = await fetch(`${API_BASE_URL}/products${buildQueryString(params)}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch products');
    
    return data.data || data;
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch product');
    
    return data.data || data;
  },

  addRating: async (id: string, payload: { star: number; comment?: string }) => {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}/ratings`, {
      method: 'PUT',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to submit rating');
    
    return data.data || data;
  },

  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update product');
    
    return data.data || data;
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/product-categories`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch categories');
    
    return data.data || data;
  },
};

export default productService;

// Legacy exports for compatibility
export const getProducts = productService.getAll;
export const getProductById = productService.getById;
export const addRating = productService.addRating;
export const getCategories = productService.getCategories;
export const updateProduct = productService.update;
