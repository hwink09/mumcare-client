const API_BASE_URL = 'http://localhost:8017/v1';

const orderService = {
  create: async (payload: { address: string; couponCode?: string }) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to create order');
    
    return data.data || data;
  },

  getMyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch orders');
    
    return data.data || data;
  },

  getAll: async (query?: { status?: string; page?: number; limit?: number }) => {
    const url = new URL(`${API_BASE_URL}/orders`);
    if (query?.status) url.searchParams.set('status', query.status);
    if (query?.page) url.searchParams.set('page', String(query.page));
    if (query?.limit) url.searchParams.set('limit', String(query.limit));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch orders');
    
    return data.data || data;
  },

  getById: async (orderId: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch order');
    
    return data.data || data;
  },

  updateStatus: async (orderId: string, status: string, extra?: { isRefunded?: boolean; supportNote?: string }) => {
    const payload: any = { status };
    if (extra?.isRefunded !== undefined) payload.isRefunded = extra.isRefunded;
    if (extra?.supportNote !== undefined) payload.supportNote = extra.supportNote;

    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update order');
    return data.data || data;
  },
};

export default orderService;

// Legacy exports for compatibility
export const createOrder = orderService.create;
export const getMyOrders = orderService.getMyOrders;
export const getOrderById = orderService.getById;
export const getAllOrders = orderService.getAll;
export const updateOrderStatus = orderService.updateStatus;
