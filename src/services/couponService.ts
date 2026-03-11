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

const couponService = {
  // Admin: get list of coupons
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'GET',
      headers: getHeaders(true),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch coupons');
    
    return data.data || data;
  },

  // Admin: create new coupon
  // Server expects: { name, discount, expiry } where
  // - name: string (coupon code, uppercased on server)
  // - discount: number (percentage)
  // - expiry: number (days from now)
  create: async (payload: {
    name: string;
    discount: number;
    expiry: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to create coupon');
    
    return data.data || data;
  },

  // Admin: update coupon
  // Same fields as create, all optional
  update: async (couponId: string, payload: {
    name?: string;
    discount?: number;
    expiry?: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${encodeURIComponent(couponId)}`, {
      method: 'PUT',
      headers: getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update coupon');
    
    return data.data || data;
  },

  delete: async (couponId: string) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${encodeURIComponent(couponId)}`, {
      method: 'DELETE',
      headers: getHeaders(true),
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to delete coupon');
    
    return data.data || data;
  },
};

export default couponService;
