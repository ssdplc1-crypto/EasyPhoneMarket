export type PhoneCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type PhoneBrand =
  | 'Apple'
  | 'Samsung'
  | 'Tecno'
  | 'Infinix'
  | 'Xiaomi'
  | 'Oppo'
  | 'Vivo'
  | 'Huawei'
  | 'Nokia'
  | 'Other';

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

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  PhoneDetails: { phoneId: string };
  PostPhone: undefined;
  EditProfile: undefined;
  Chat: { chatId: string; phoneTitle: string; otherUserName: string };
  SellerProfile: { sellerId: string };
  Search: undefined;
  Favorites: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Sell: undefined;
  Favorites: undefined;
  Profile: undefined;
};
