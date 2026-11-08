import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserMe } from '../services/api';
import { authStore } from './store';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

interface AuthContextType {
  user: UserMe | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [user, setUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!authStore.getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch {
      authStore.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    authStore.setToken(tokens.access_token);
    await refreshUser();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user && authStore.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      <ThemeProvider userTheme={user?.theme} isAuthenticated={isAuthenticated}>
        <LanguageProvider userLanguage={user?.language} isAuthenticated={isAuthenticated}>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};
