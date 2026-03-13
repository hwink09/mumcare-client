const API_BASE_URL = 'http://localhost:8017/v1';

const authService = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Registration failed');
    return data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Login failed');

    // Server response shape:
    // { success, message, accessToken, data: user }
    const token = data.accessToken || data?.data?.accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }

    // Always return the user object for convenience
    const user = data?.data || data?.user || data;
    return user;
  },

  logout: async () => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/auth/logout`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    // Clear token from localStorage
    localStorage.removeItem('accessToken');

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Logout failed');
    return data;
  },

  getMe: async (): Promise<{ firstName?: string; lastName?: string; email?: string; phone?: string; role?: string; _id?: string; id?: string }> => {
    const fetchMe = async () => {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      const data = await response.json();
      return { response, data };
    };

    // First attempt with current access token
    let { response, data } = await fetchMe();

    // If access token is expired (401/403/410 or specific message), try to refresh once
    if (
      !response.ok &&
      (response.status === 401 ||
        response.status === 403 ||
        response.status === 410 ||
        typeof data?.message === 'string' &&
          data.message.toLowerCase().includes('token expired'))
    ) {
      try {
        await refreshAccessToken();
        ({ response, data } = await fetchMe());
      } catch {
        // Refresh failed, clear token and rethrow below
        localStorage.removeItem('accessToken');
      }
    }

    if (!response.ok) {
      // If still unauthorized after refresh, ensure local token is cleared
      if (response.status === 401 || response.status === 403 || response.status === 410) {
        localStorage.removeItem('accessToken');
      }
      throw new Error(data?.message || 'Failed to fetch user');
    }

    return data.data || data;
  },

  updateProfile: async (userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update profile');
    
    return data.data || data;
  },

  getUsers: async (query?: {
    role?: string;
    isBlocked?: boolean;
    email?: string;
    phone?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = new URL(`${API_BASE_URL}/users`);
    if (query?.role) url.searchParams.set('role', query.role);
    if (query?.isBlocked !== undefined) url.searchParams.set('isBlocked', String(query.isBlocked));
    if (query?.email) url.searchParams.set('email', query.email);
    if (query?.phone) url.searchParams.set('phone', query.phone);
    if (query?.page) url.searchParams.set('page', String(query.page));
    if (query?.limit) url.searchParams.set('limit', String(query.limit));
    if (query?.sort) url.searchParams.set('sort', query.sort);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to fetch users');

    return data.data || data;
  },

  updateUserByAdmin: async (userId: string, payload: Record<string, unknown>) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to update user');

    return data.data || data;
  },

  deleteUser: async (userId: string) => {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to delete user');

    return data.data || data;
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/users/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to send reset link');
    
    return data;
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/users/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password, confirmPassword }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to reset password');
    
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

// Refresh Access Token
export const refreshAccessToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Để gửi refreshToken cookie
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    // Cập nhật accessToken
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};
