import axiosInstance from '../utils/axios';

export type GetProductsParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
};

const productService = {
  getAll: async (params: GetProductsParams = {}) => {
    const data: any = await axiosInstance.get('/products', { params });
    return data.data || data;
  },

  getAllWithPagination: async (params: GetProductsParams = {}) => {
    const data: any = await axiosInstance.get('/products', { params });
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return {
        data: Array.isArray(data.data) ? data.data : [],
        pagination: data.pagination || null,
      };
    }
    return {
      data: Array.isArray(data) ? data : [],
      pagination: null,
    };
  },

  getById: async (id: string) => {
    const data: any = await axiosInstance.get(`/products/${encodeURIComponent(id)}`);
    return data.data || data;
  },

  addRating: async (id: string, payload: { star: number; comment?: string }) => {
    const data: any = await axiosInstance.put(`/products/${encodeURIComponent(id)}/ratings`, payload);
    return data.data || data;
  },

  create: async (formData: FormData) => {
    const data: any = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  update: async (id: string, formData: FormData) => {
    const data: any = await axiosInstance.put(`/products/${encodeURIComponent(id)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  getCategories: async () => {
    const data: any = await axiosInstance.get('/product-categories');
    return data.data || data;
  },

  delete: async (id: string) => {
    const data: any = await axiosInstance.delete(`/products/${encodeURIComponent(id)}`);
    return data.data || data;
  },
};

export default productService;

// Legacy exports for compatibility
export const getProducts = productService.getAll;
export const getProductsWithPagination = productService.getAllWithPagination;
export const getProductById = productService.getById;
export const createProduct = productService.create;
export const updateProduct = productService.update;
export const getCategories = productService.getCategories;
export const deleteProduct = productService.delete;
export const addRating = productService.addRating;
