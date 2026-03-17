import axiosInstance from '../utils/axios';
import { removeToken, setToken } from "../utils/token";

const authService = {
  register: async (userData: any) => {
    const data: any = await axiosInstance.post('/users/auth/register', userData);
    return data;
  },

  login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const data: any = await axiosInstance.post('/users/auth/login', credentials);
    
    // Extract token
    const token = data.accessToken || data?.data?.accessToken;
    if (token) {
      setToken(token, credentials.rememberMe || false);
    }
    
    return data?.data || data?.user || data;
  },

  logout: async () => {
    const data: any = await axiosInstance.delete('/users/auth/logout');
    removeToken();
    return data;
  },

  getMe: async () => {
    // Axios interceptor automatically handles sending token and refresh retry if 401
    const data: any = await axiosInstance.get('/users/me');
    return data.data || data;
  },

  updateProfile: async (userData: any) => {
    const data: any = await axiosInstance.put('/users/me', userData);
    return data.data || data;
  },

  getUsers: async (query?: { role?: string; isBlocked?: boolean; email?: string; phone?: string; page?: number; limit?: number; sort?: string; }) => {
    const params = { ...query };
    const data: any = await axiosInstance.get('/users', { params });
    return data.data || data;
  },

  updateUserByAdmin: async (userId: string, payload: Record<string, unknown>) => {
    const data: any = await axiosInstance.put(`/users/${encodeURIComponent(userId)}`, payload);
    return data.data || data;
  },

  deleteUser: async (userId: string) => {
    const data: any = await axiosInstance.delete(`/users/${encodeURIComponent(userId)}`);
    return data.data || data;
  },

  forgotPassword: async (email: string) => {
    const data: any = await axiosInstance.post('/users/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const data: any = await axiosInstance.post(`/users/auth/reset-password/${token}`, { password });
    return data;
  },
};

export default authService;

// Legacy exports for compatibility
export const registerUser = authService.register;
export const loginUser = authService.login;
export const logoutUser = authService.logout;
export const getCurrentUser = authService.getMe;
export const updateProfile = authService.updateProfile;
export const getUsers = authService.getUsers;
export const updateUserByAdmin = authService.updateUserByAdmin;
export const deleteUser = authService.deleteUser;

// If explicitly called by some component, redirect to standard logout to clear everything
export const refreshAccessToken = async () => {
  try {
    const data: any = await axiosInstance.post('/users/auth/refresh-token');
    const newAccessToken = data.accessToken || data.data?.accessToken;
    if (newAccessToken) {
      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', newAccessToken);
      } else {
        sessionStorage.setItem('accessToken', newAccessToken);
      }
    }
    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};
