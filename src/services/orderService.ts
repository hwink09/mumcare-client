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
};

export default orderService;

// Legacy exports for compatibility
export const createOrder = orderService.create;
export const getMyOrders = orderService.getMyOrders;
export const getOrderById = orderService.getById;
