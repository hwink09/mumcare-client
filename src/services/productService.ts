const API_BASE_URL = 'http://localhost:8017/v1';

export const getProducts = async (params?: { page?: number; limit?: number }) => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;
    const resp = await fetch(`${API_BASE_URL}/products?page=${page}&limit=${limit}`);
    const text = await resp.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error('Invalid JSON from product API');
    }

    if (!resp.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    return data;
  } catch (error) {
    console.error('getProducts error:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const resp = await fetch(`${API_BASE_URL}/product-categories`);
    const text = await resp.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error('Invalid JSON from categories API');
    }

    if (!resp.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data;
  } catch (error) {
    console.error('getCategories error:', error);
    throw error;
  }
};

export default { getProducts, getCategories };
