const API_BASE_URL = 'http://localhost:8017/v1';

const blogService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch blogs');
    
    return data.data || data;
  },

  getById: async (blogId: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(blogId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch blog');
    
    return data.data || data;
  },

  likeBlog: async (blogId: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(blogId)}/like`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to like blog');
    
    return data.data || data;
  },

  dislikeBlog: async (blogId: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${encodeURIComponent(blogId)}/dislike`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to dislike blog');
    
    return data.data || data;
  },

  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/blog-categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch blog categories');
    
    return data.data || data;
  },
};

export default blogService;

// Legacy exports for compatibility
export const getBlogs = blogService.getAll;
export const getBlogById = blogService.getById;
export const getBlogCategories = blogService.getCategories;
