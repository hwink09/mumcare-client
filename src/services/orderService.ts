import axiosInstance from '../utils/axios';

const orderService = {
  create: async (payload: { address: string; couponCode?: string }) => {
    const data: any = await axiosInstance.post('/orders', payload);
    return data.data || data;
  },

  getMyOrders: async () => {
    const data: any = await axiosInstance.get('/orders/me');
    return data.data || data;
  },

  getAll: async (query?: { status?: string; page?: number; limit?: number }) => {
    const data: any = await axiosInstance.get('/orders', { params: query });
    return data.data || data;
  },

  getById: async (orderId: string) => {
    const data: any = await axiosInstance.get(`/orders/${encodeURIComponent(orderId)}`);
    return data.data || data;
  },

  updateStatus: async (orderId: string, status: string, extra?: { isRefunded?: boolean; supportNote?: string }) => {
    const payload: any = { status };
    if (extra?.isRefunded !== undefined) payload.isRefunded = extra.isRefunded;
    if (extra?.supportNote !== undefined) payload.supportNote = extra.supportNote;

    const data: any = await axiosInstance.put(`/orders/${encodeURIComponent(orderId)}`, payload);
    return data.data || data;
  },

  delete: async (orderId: string) => {
    const data: any = await axiosInstance.delete(`/orders/${encodeURIComponent(orderId)}`);
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
export const deleteOrder = orderService.delete;
