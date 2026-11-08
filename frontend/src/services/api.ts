import axios from 'axios';
import { authStore } from '../app/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clearToken();
    }
    return Promise.reject(error);
  }
);

export interface RegisterDTO {
  phone: string;
  password: string;
  full_name: string;
  email?: string;
}

export interface LoginDTO {
  phone: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserMe {
  id: string;
  phone: string;
  email?: string;
  full_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
}

export const authService = {
  async register(data: RegisterDTO): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/register', data);
    authStore.setToken(res.data.access_token);
    return res.data;
  },

  async login(data: LoginDTO): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/login', data);
    authStore.setToken(res.data.access_token);
    return res.data;
  },

  async getMe(): Promise<UserMe> {
    const res = await apiClient.get<UserMe>('/auth/me');
    return res.data;
  },

  logout(): void {
    authStore.clearToken();
  },
};

