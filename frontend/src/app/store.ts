/**
 * Simple client state store for AuctionHub (Authentication & Theme).
 */

export interface AuthState {
  token: string | null;
  user: any | null;
}

const TOKEN_KEY = 'auctionhub_token';

export const authStore = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};

