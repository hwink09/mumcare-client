const API_BASE_URL = 'http://localhost:8017/v1';

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}) => {
  try {
    console.log('Registering user with:', userData);
    const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Để gửi cookie
      body: JSON.stringify(userData),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

// Login User
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    console.log('Logging in with:', credentials);
    const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Để nhận cookie refreshToken
      body: JSON.stringify(credentials),
    });

    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Response text:', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Server returned invalid JSON');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Lưu accessToken vào localStorage
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}/users/auth/logout`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    // Xóa accessToken từ localStorage
    localStorage.removeItem('accessToken');

    return data;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};


export const getCurrentUser = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};

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
