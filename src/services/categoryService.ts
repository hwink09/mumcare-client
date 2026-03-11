const API_BASE_URL = 'http://localhost:8017/v1';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const categoryService = {
  getProductCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/product-categories`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch product categories');
    
    return data.data || data;
  },

  getBlogCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/blog-categories`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch blog categories');
    
    return data.data || data;
  },
};

export default categoryService;

// Legacy exports for compatibility
export const getProductCategories = categoryService.getProductCategories;
export const getBlogCategories = categoryService.getBlogCategories;
