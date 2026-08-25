export type PhoneCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type PhoneBrand =
  | 'Apple' | 'Samsung' | 'Tecno' | 'Infinix' | 'Xiaomi'
  | 'Oppo' | 'Vivo' | 'Huawei' | 'Nokia' | 'Other';

export type UserRole = 'user' | 'admin';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Phone {
  id: string;
  title: string;
  brand: PhoneBrand;
  model: string;
  price: number;
  condition: PhoneCondition;
  description: string;
  images: string[];
  location: string;
  state: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerRating: number;
  createdAt: string;
  isFavorite?: boolean;
  views?: number;
  isPublished?: boolean;
  commissionType?: 'fixed' | 'percent';
  commissionValue?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  location?: string;
  rating?: number;
  totalSales?: number;
  joinedAt: string;
  role?: UserRole;
  referralCode?: string | null;
  referralBalance?: number;
  referredBy?: string | null;
}

export interface CartItem {
  phoneId: string;
  quantity: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  phoneId: string;
  phoneTitle: string;
  buyerId: string;
  sellerId: string;
  lastMessage?: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ContactSettings {
  phone: string;
  whatsapp: string;
  chatEnabled: boolean;
  callEnabled: boolean;
  whatsappEnabled: boolean;
  supportLabel: string;
  updatedAt: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  VerifyOtp: { verificationId: string; destination: string; channel: 'email' | 'sms' };
  PhoneDetails: { phoneId: string };
  PostPhone: undefined;
  EditProfile: undefined;
  Chat: { chatId: string; phoneTitle: string; otherUserName: string };
  SellerProfile: { sellerId: string };
  Search: undefined;
  Favorites: undefined;
  Categories: undefined;
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  AdminTabs: undefined;
};

export type AdminTabParamList = { Dashboard: undefined; AddPhone: undefined; Orders: undefined; Settings: undefined; };

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Favorites: undefined;
  Profile: undefined;
};
