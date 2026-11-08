import React, { createContext, useContext, useEffect, useState } from 'react';
import { usersService } from '../services/api';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (newTheme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: async () => {},
  toggleTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
  userTheme?: string;
  isAuthenticated?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  userTheme,
  isAuthenticated = false,
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // default is light (kunduzgi)
  });

  // Apply theme to DOM
  const applyThemeToDOM = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Sync with user's backend profile when available
  useEffect(() => {
    if (userTheme === 'dark' || userTheme === 'light') {
      setThemeState(userTheme);
      localStorage.setItem('theme', userTheme);
      applyThemeToDOM(userTheme);
    }
  }, [userTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeToDOM(newTheme);

    if (isAuthenticated) {
      try {
        await usersService.updateProfile({ theme: newTheme });
      } catch (err) {
        console.error('Failed to sync theme with backend:', err);
      }
    }
  };

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    await setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

