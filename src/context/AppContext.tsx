import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, t } from '../constants';
import { User, Phone } from '../types';
import { mockPhones, mockUsers } from '../services/mockData';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  texts: typeof t.en;
  user: User | null;
  setUser: (user: User | null) => void;
  phones: Phone[];
  setPhones: (phones: Phone[]) => void;
  favorites: string[];
  toggleFavorite: (phoneId: string) => void;
  isFavorite: (phoneId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ha');
  const [user, setUser] = useState<User | null>(null);
  const [phones, setPhones] = useState<Phone[]>(mockPhones);
  const [favorites, setFavorites] = useState<string[]>([]);

  const texts = t[language];

  const toggleFavorite = (phoneId: string) => {
    setFavorites((prev) =>
      prev.includes(phoneId)
        ? prev.filter((id) => id !== phoneId)
        : [...prev, phoneId]
    );
  };

  const isFavorite = (phoneId: string) => favorites.includes(phoneId);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        texts,
        user,
        setUser,
        phones,
        setPhones,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
