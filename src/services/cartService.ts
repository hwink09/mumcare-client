import axiosInstance from '../utils/axios';

const cartService = {
  addItem: async (productId: string, count = 1) => {
    const data: any = await axiosInstance.post('/users/me/cart', { productId, count });
    return data.data || data;
  },

  updateItem: async (productId: string, count: number) => {
    const data: any = await axiosInstance.put('/users/me/cart', { productId, count });
    return data.data || data;
  },

  removeItem: async (productId: string) => {
    const data: any = await axiosInstance.delete(`/users/me/cart/${encodeURIComponent(productId)}`);
    return data.data || data;
  },

  clear: async () => {
    const data: any = await axiosInstance.delete('/users/me/cart/clear');
    return data.data || data;
  },
};

export default cartService;

// Legacy exports for compatibility
export const addToCartApi = cartService.addItem;
export const updateCartItemApi = cartService.updateItem;
export const removeCartItemApi = cartService.removeItem;
export const clearCartApi = cartService.clear;
