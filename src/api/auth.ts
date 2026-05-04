import { apiClient } from './client';
import { User } from '../store/authStore';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  nationality: string;
  domicile: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<{ access_token: string }> => {
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
};
