import axiosInstance from '../utils/axios';

const couponService = {
  getAll: async () => {
    const data: any = await axiosInstance.get('/coupons');
    return data.data || data;
  },

  create: async (payload: { name: string; discount: number; expiry: number; }) => {
    const data: any = await axiosInstance.post('/coupons', payload);
    return data.data || data;
  },

  update: async (couponId: string, payload: { name?: string; discount?: number; expiry?: number; }) => {
    const data: any = await axiosInstance.put(`/coupons/${encodeURIComponent(couponId)}`, payload);
    return data.data || data;
  },

  delete: async (couponId: string) => {
    const data: any = await axiosInstance.delete(`/coupons/${encodeURIComponent(couponId)}`);
    return data.data || data;
  },

  getMyCoupons: async () => {
    const data: any = await axiosInstance.get('/coupons/me');
    return data.data || data;
  },
};

export default couponService;
