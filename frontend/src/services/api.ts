import axios from 'axios';
import { authStore } from '../app/store';
import {
  Auction,
  Bid,
  Category,
  Deposit,
  Notification,
  PaginatedResponse,
  ParticipationStatus,
  Product,
} from '../types';

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

export interface AuctionCreateDTO {
  product_id: string;
  starting_price_uzs: number;
  reserve_price_uzs: number;
  min_bid_increment_uzs: number;
  deposit_amount_uzs: number;
  start_time: string;
  end_time: string;
  delivery_info?: string;
  rules?: string;
}

export interface ProductCreateDTO {
  title: string;
  description: string;
  category_id: string;
  condition: string;
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

export const auctionsService = {
  async list(params?: {
    category_id?: string;
    status?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Auction>> {
    const res = await apiClient.get<PaginatedResponse<Auction>>('/auctions', { params });
    return res.data;
  },

  async getById(id: string): Promise<Auction> {
    const res = await apiClient.get<Auction>(`/auctions/${id}`);
    return res.data;
  },

  async create(data: AuctionCreateDTO): Promise<Auction> {
    const res = await apiClient.post<Auction>('/auctions', data);
    return res.data;
  },

  async publish(id: string): Promise<Auction> {
    const res = await apiClient.post<Auction>(`/auctions/${id}/publish`);
    return res.data;
  },

  async cancel(id: string, reason: string): Promise<Auction> {
    const res = await apiClient.post<Auction>(`/auctions/${id}/cancel`, null, {
      params: { reason },
    });
    return res.data;
  },

  async getMyCreated(): Promise<Auction[]> {
    const res = await apiClient.get<Auction[]>('/auctions/my/created');
    return res.data;
  },

  async getMyParticipating(): Promise<Auction[]> {
    const res = await apiClient.get<Auction[]>('/auctions/my/participating');
    return res.data;
  },

  async getMyWon(): Promise<Auction[]> {
    const res = await apiClient.get<Auction[]>('/auctions/my/won');
    return res.data;
  },
};

export const biddingService = {
  async submitBid(auctionId: string, amountUzs: number): Promise<Bid> {
    const res = await apiClient.post<Bid>(`/auctions/${auctionId}/bids`, {
      amount_uzs: amountUzs,
    });
    return res.data;
  },

  async listBids(auctionId: string, limit = 50, offset = 0): Promise<Bid[]> {
    const res = await apiClient.get<Bid[]>(`/auctions/${auctionId}/bids`, {
      params: { limit, offset },
    });
    return res.data;
  },
};

export const participantsService = {
  async participate(auctionId: string): Promise<{ id: string; status: string }> {
    const res = await apiClient.post<{ id: string; status: string }>(
      `/auctions/${auctionId}/participate`
    );
    return res.data;
  },

  async getParticipationStatus(auctionId: string): Promise<ParticipationStatus> {
    const res = await apiClient.get<ParticipationStatus>(
      `/auctions/${auctionId}/participation`
    );
    return res.data;
  },
};

export const depositsService = {
  async getMyDeposits(): Promise<Deposit[]> {
    const res = await apiClient.get<Deposit[]>('/deposits/my');
    return res.data;
  },
};

export const notificationsService = {
  async list(limit = 50, offset = 0): Promise<Notification[]> {
    const res = await apiClient.get<Notification[]>('/notifications', {
      params: { limit, offset },
    });
    return res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ unread_count: number }>('/notifications/unread-count');
    return res.data.unread_count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<{ marked_read_count: number }> {
    const res = await apiClient.post<{ marked_read_count: number }>('/notifications/read-all');
    return res.data;
  },
};

export const categoriesService = {
  async list(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>('/categories');
    return res.data;
  },

  async create(data: { name: string; description?: string; icon?: string; slug?: string }): Promise<Category> {
    // Try custom/user endpoint first, falls back if needed
    try {
      const res = await apiClient.post<Category>('/categories/custom', data);
      return res.data;
    } catch {
      const res = await apiClient.post<Category>('/categories', data);
      return res.data;
    }
  },
};

export const productsService = {
  async list(): Promise<PaginatedResponse<Product>> {
    const res = await apiClient.get<PaginatedResponse<Product>>('/products');
    return res.data;
  },

  async create(data: ProductCreateDTO): Promise<Product> {
    const res = await apiClient.post<Product>('/products', data);
    return res.data;
  },

  async uploadImage(productId: string, file: File): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ image_url: string }>(
      `/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  async uploadMedia(productId: string, files: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    try {
      const res = await apiClient.post<{ uploaded_urls: string[]; count: number }>(
        `/products/${productId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data.uploaded_urls;
    } catch {
      // Fallback to sequential single upload
      const urls: string[] = [];
      for (const file of files) {
        const singleData = new FormData();
        singleData.append('file', file);
        const res = await apiClient.post<{ image_url: string }>(
          `/products/${productId}/images`,
          singleData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        urls.push(res.data.image_url);
      }
      return urls;
    }
  },
};

export const getMediaUrl = (url?: string): string => {
  if (!url) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80';
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const isVideoMedia = (url?: string): boolean => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url);
};

export const usersService = {
  async getMyProfile(): Promise<any> {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  async updateProfile(data: {
    full_name?: string;
    email?: string;
    city?: string;
    address?: string;
    bio?: string;
  }): Promise<any> {
    const res = await apiClient.patch('/users/me', data);
    return res.data;
  },

  async changePassword(data: { old_password: string; new_password: string }): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/users/me/change-password', data);
    return res.data;
  },
};

export const adminService = {
  async getDashboard(): Promise<any> {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  async moderateAuction(auctionId: string, approved: boolean, moderationNotes?: string): Promise<any> {
    const res = await apiClient.post(`/admin/auctions/${auctionId}/moderate`, {
      approved,
      moderation_notes: moderationNotes,
    });
    return res.data;
  },

  async updateUserStatus(userId: string, status: string, reason?: string): Promise<any> {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, {
      status,
      reason,
    });
    return res.data;
  },
};

export const favoritesService = {
  async toggle(auctionId: string): Promise<{ auction_id: string; is_favorite: boolean }> {
    const res = await apiClient.post<{ auction_id: string; is_favorite: boolean }>(
      `/favorites/${auctionId}/toggle`
    );
    return res.data;
  },

  async getStatus(auctionId: string): Promise<{ auction_id: string; is_favorite: boolean }> {
    const res = await apiClient.get<{ auction_id: string; is_favorite: boolean }>(
      `/favorites/${auctionId}/status`
    );
    return res.data;
  },

  async list(): Promise<Auction[]> {
    const res = await apiClient.get<Auction[]>('/favorites');
    return res.data;
  },

  async getIds(): Promise<string[]> {
    const res = await apiClient.get<string[]>('/favorites/ids');
    return res.data;
  },
};
