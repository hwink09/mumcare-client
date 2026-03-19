import axiosInstance from '../utils/axios';

const blogService = {
  getAll: async () => {
    const data: any = await axiosInstance.get('/blogs');
    return data.data || data;
  },

  getById: async (blogId: string) => {
    const data: any = await axiosInstance.get(`/blogs/${encodeURIComponent(blogId)}`);
    return data.data || data;
  },

  likeBlog: async (blogId: string) => {
    const data: any = await axiosInstance.put(`/blogs/${encodeURIComponent(blogId)}/like`, {});
    return data.data || data;
  },

  dislikeBlog: async (blogId: string) => {
    const data: any = await axiosInstance.put(`/blogs/${encodeURIComponent(blogId)}/dislike`, {});
    return data.data || data;
  },

  create: async (formData: FormData) => {
    const data: any = await axiosInstance.post('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  update: async (blogId: string, formData: FormData) => {
    const data: any = await axiosInstance.put(`/blogs/${encodeURIComponent(blogId)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.data || data;
  },

  delete: async (blogId: string) => {
    const data: any = await axiosInstance.delete(`/blogs/${encodeURIComponent(blogId)}`);
    return data.data || data;
  },

  getCategories: async () => {
    const data: any = await axiosInstance.get('/blog-categories');
    return data.data || data;
  },
};

export default blogService;

// Legacy exports for compatibility
export const getBlogs = blogService.getAll;
export const getBlogById = blogService.getById;
export const getBlogCategories = blogService.getCategories;
export const createBlog = blogService.create;
export const updateBlog = blogService.update;
export const deleteBlog = blogService.delete;
export const likeBlog = blogService.likeBlog;
export const dislikeBlog = blogService.dislikeBlog;
