import axiosInstance from '../utils/axios';

const categoryService = {
  // Product Categories
  getProductCategories: async () => {
    const data: any = await axiosInstance.get('/product-categories');
    return data.data || data;
  },

  createProductCategory: async (payload: { title: string }) => {
    const data: any = await axiosInstance.post('/product-categories', payload);
    return data.data || data;
  },

  updateProductCategory: async (categoryId: string, payload: { title?: string }) => {
    const data: any = await axiosInstance.put(`/product-categories/${encodeURIComponent(categoryId)}`, payload);
    return data.data || data;
  },

  deleteProductCategory: async (categoryId: string) => {
    const data: any = await axiosInstance.delete(`/product-categories/${encodeURIComponent(categoryId)}`);
    return data.data || data;
  },

  // Blog Categories
  getBlogCategories: async () => {
    const data: any = await axiosInstance.get('/blog-categories');
    return data.data || data;
  },

  createBlogCategory: async (payload: { title: string }) => {
    const data: any = await axiosInstance.post('/blog-categories', payload);
    return data.data || data;
  },

  updateBlogCategory: async (categoryId: string, payload: { title?: string }) => {
    const data: any = await axiosInstance.put(`/blog-categories/${encodeURIComponent(categoryId)}`, payload);
    return data.data || data;
  },

  deleteBlogCategory: async (categoryId: string) => {
    const data: any = await axiosInstance.delete(`/blog-categories/${encodeURIComponent(categoryId)}`);
    return data.data || data;
  },
};

export default categoryService;

// Legacy exports for compatibility
export const getProductCategories = categoryService.getProductCategories;
export const createProductCategory = categoryService.createProductCategory;
export const updateProductCategory = categoryService.updateProductCategory;
export const deleteProductCategory = categoryService.deleteProductCategory;
export const getBlogCategories = categoryService.getBlogCategories;
export const createBlogCategory = categoryService.createBlogCategory;
export const updateBlogCategory = categoryService.updateBlogCategory;
export const deleteBlogCategory = categoryService.deleteBlogCategory;
