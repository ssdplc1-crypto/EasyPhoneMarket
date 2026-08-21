import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, t } from '../constants';
import { CartItem, ContactSettings, User, Phone } from '../types';
import { mockPhones } from '../services/mockData';
import { fetchPhones } from '../services/firebaseService';
import { isFirebaseConfigured } from '../services/firebase';
import { DEFAULT_CONTACT_SETTINGS, loadContactSettings } from '../services/settingsService';

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
  cart: CartItem[];
  addToCart: (phoneId: string) => void;
  removeFromCart: (phoneId: string) => void;
  updateCartQty: (phoneId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  contactSettings: ContactSettings;
  setContactSettings: (settings: ContactSettings) => void;
  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const PHONES_KEY = '@fulatan_mock_phones_v2';
const CART_KEY = '@fulatan_cart_v1';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ha');
  const [user, setUser] = useState<User | null>(null);
  const [phones, setPhonesState] = useState<Phone[]>(mockPhones);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [contactSettings, setContactSettingsState] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    (async () => {
      try {
        if (isFirebaseConfigured) {
          const cloudPhones = await fetchPhones();
          if (cloudPhones.length) setPhonesState(cloudPhones);
        } else {
          const savedPhones = await AsyncStorage.getItem(PHONES_KEY);
          if (savedPhones) setPhonesState(JSON.parse(savedPhones));
        }
        const savedCart = await AsyncStorage.getItem(CART_KEY);
        if (savedCart) setCart(JSON.parse(savedCart));
      } catch {}
      setContactSettingsState(await loadContactSettings());
    })();
  }, []);

  const setPhones = (next: Phone[]) => {
    setPhonesState(next);
    AsyncStorage.setItem(PHONES_KEY, JSON.stringify(next)).catch(() => {});
  };

  const persistCart = (next: CartItem[]) => {
    setCart(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next)).catch(() => {});
  };

  const addToCart = (phoneId: string) => {
    const existing = cart.find((x) => x.phoneId === phoneId);
    persistCart(existing
      ? cart.map((x) => x.phoneId === phoneId ? { ...x, quantity: x.quantity + 1 } : x)
      : [...cart, { phoneId, quantity: 1 }]);
  };
  const removeFromCart = (phoneId: string) => persistCart(cart.filter((x) => x.phoneId !== phoneId));
  const updateCartQty = (phoneId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(phoneId);
    persistCart(cart.map((x) => x.phoneId === phoneId ? { ...x, quantity } : x));
  };
  const clearCart = () => persistCart([]);

  const setContactSettings = (settings: ContactSettings) => setContactSettingsState(settings);
  const texts = t[language];
  const toggleFavorite = (phoneId: string) => setFavorites((prev) => prev.includes(phoneId) ? prev.filter((id) => id !== phoneId) : [...prev, phoneId]);
  const isFavorite = (phoneId: string) => favorites.includes(phoneId);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + ((phones.find((p) => p.id === item.phoneId)?.price || 0) * item.quantity), 0);
  const isAdmin = user?.role === 'admin';

  return (
    <AppContext.Provider value={{ language, setLanguage, texts, user, setUser, phones, setPhones, favorites, toggleFavorite, isFavorite, cart, addToCart, removeFromCart, updateCartQty, clearCart, cartCount, cartTotal, contactSettings, setContactSettings, isAdmin }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
