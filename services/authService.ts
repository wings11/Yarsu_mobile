import { supabase } from '@/libs/supabase';
import { Platform } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

export const getAuthToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('authToken');
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

export const getUserRole = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();

    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        if (errorData) errorText = errorData.error || errorData.message || JSON.stringify(errorData);
      } else {
        errorText = await response.text().catch(() => errorText);
      }
      throw new Error(errorText || `Failed to fetch user role (status ${response.status})`);
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '<no body>');
      throw new Error(`Invalid response from server (expected JSON): ${text}`);
    }

    const data = await response.json().catch((e) => { throw new Error('Failed to parse JSON response for user role'); });
    return data.user;
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
};

// Small helper so callers consistently treat "superadmin" as an admin-level role
export const isAdminRole = (role: string | undefined | null) => {
  return role === 'admin' || role === 'superadmin';
};

export const getAllUsers = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        if (errorData) errorText = errorData.error || errorData.message || JSON.stringify(errorData);
      } else {
        errorText = await response.text().catch(() => errorText);
      }
      throw new Error(errorText || `Failed to fetch users (status ${response.status})`);
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '<no body>');
      throw new Error(`Invalid response from server (expected JSON): ${text}`);
    }

    const data = await response.json().catch(() => { throw new Error('Failed to parse JSON response for users list'); });
    return data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, newRole: string) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No authentication token found');
    const response = await fetch(`${API_BASE_URL}/auth/users/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, newRole }),
    });

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        if (errorData) errorText = errorData.error || errorData.message || JSON.stringify(errorData);
      } else {
        errorText = await response.text().catch(() => errorText);
      }
      throw new Error(errorText || `Failed to update user role (status ${response.status})`);
    }

    if (!contentType.includes('application/json')) {
      const text = await response.text().catch(() => '<no body>');
      throw new Error(`Invalid response from server (expected JSON): ${text}`);
    }

    const data = await response.json().catch(() => { throw new Error('Failed to parse JSON response for updateUserRole'); });
    return data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};