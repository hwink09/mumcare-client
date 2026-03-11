const API_BASE_URL = 'http://localhost:8017/v1';

const cartService = {
  addItem: async (productId: string, count = 1) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, count }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to add to cart');
    
    return data.data || data;
  },

  updateItem: async (productId: string, count: number) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, count }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update cart');
    
    return data.data || data;
  },

  removeItem: async (productId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to remove item');
    
    return data.data || data;
  },

  clear: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/cart/clear`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to clear cart');
    
    return data.data || data;
  },
};

export default cartService;

// Legacy exports for compatibility
export const addToCartApi = cartService.addItem;
export const updateCartItemApi = cartService.updateItem;
export const removeCartItemApi = cartService.removeItem;
export const clearCartApi = cartService.clear;
