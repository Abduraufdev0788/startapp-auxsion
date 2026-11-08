import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, Translations } from '../i18n/translations';
import { usersService } from '../services/api';

interface LanguageContextType {
  language: Language;
  setLanguage: (newLang: Language) => Promise<void>;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'uz',
  setLanguage: async () => {},
  t: translations.uz,
});

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
  userLanguage?: string;
  isAuthenticated?: boolean;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  userLanguage,
  isAuthenticated = false,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved;
    return 'uz'; // default is uz
  });

  // Sync with user's backend profile when available
  useEffect(() => {
    if (userLanguage === 'uz' || userLanguage === 'ru' || userLanguage === 'en') {
      setLanguageState(userLanguage);
      localStorage.setItem('lang', userLanguage);
    }
  }, [userLanguage]);

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('lang', newLang);

    if (isAuthenticated) {
      try {
        await usersService.updateProfile({ language: newLang });
      } catch (err) {
        console.error('Failed to sync language with backend:', err);
      }
    }
  };

  const t = translations[language] || translations.uz;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
