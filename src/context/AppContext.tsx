import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, t, BRANDS } from '../constants';
import { CartItem, ContactSettings, User, Phone, Category } from '../types';
import { fetchPhones, fetchCategories, getCurrentUser } from '../services/api';
import { DEFAULT_CONTACT_SETTINGS, loadContactSettings } from '../services/settingsService';

interface AppContextType {
 language: Language; setLanguage:(lang:Language)=>void; texts:typeof t.en; user:User|null; setUser:(user:User|null)=>void;
 phones:Phone[]; categories:Category[]; setPhones:(phones:Phone[])=>void; favorites:string[]; toggleFavorite:(phoneId:string)=>void; isFavorite:(phoneId:string)=>boolean;
 cart:CartItem[]; addToCart:(phoneId:string)=>void; removeFromCart:(phoneId:string)=>void; updateCartQty:(phoneId:string,quantity:number)=>void; clearCart:()=>void; cartCount:number; cartTotal:number;
 contactSettings:ContactSettings; setContactSettings:(settings:ContactSettings)=>void; isAdmin:boolean;
}
const AppContext=createContext<AppContextType|undefined>(undefined);
const CART_KEY='@fulatan_cart_v2'; const LANG_KEY='@fulatan_language_v2';
export const AppProvider=({children}:{children:ReactNode})=>{
 const [language,setLanguageState]=useState<Language>('ha'); const [user,setUser]=useState<User|null>(null); const [phones,setPhonesState]=useState<Phone[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [favorites,setFavorites]=useState<string[]>([]); const [cart,setCart]=useState<CartItem[]>([]); const [contactSettings,setContactSettingsState]=useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
 useEffect(()=>{(async()=>{
  const savedLang=await AsyncStorage.getItem(LANG_KEY); if(savedLang==='ha'||savedLang==='en')setLanguageState(savedLang);
  const savedCart=await AsyncStorage.getItem(CART_KEY); if(savedCart)try{setCart(JSON.parse(savedCart));}catch{}
  try{const savedUser=await getCurrentUser();if(savedUser)setUser(savedUser);}catch{}
  try{setPhonesState(await fetchPhones());}catch(e){console.warn('Could not load phones from API',e);}
  try{setCategories(await fetchCategories());}catch{setCategories(BRANDS.map(name=>({id:name,name,slug:name.toLowerCase()})));}
  try{setContactSettingsState(await loadContactSettings());}catch(e){console.warn('Could not load contact settings',e);}
 })();},[]);
 const setLanguage=(lang:Language)=>{setLanguageState(lang);AsyncStorage.setItem(LANG_KEY,lang).catch(()=>{});};
 const setPhones=(next:Phone[])=>setPhonesState(next);
 const persistCart=(next:CartItem[])=>{setCart(next);AsyncStorage.setItem(CART_KEY,JSON.stringify(next)).catch(()=>{});};
 const addToCart=(phoneId:string)=>{const existing=cart.find(x=>x.phoneId===phoneId);persistCart(existing?cart.map(x=>x.phoneId===phoneId?{...x,quantity:x.quantity+1}:x):[...cart,{phoneId,quantity:1}]);};
 const removeFromCart=(phoneId:string)=>persistCart(cart.filter(x=>x.phoneId!==phoneId));
 const updateCartQty=(phoneId:string,quantity:number)=>quantity<=0?removeFromCart(phoneId):persistCart(cart.map(x=>x.phoneId===phoneId?{...x,quantity}:x));
 const clearCart=()=>persistCart([]); const setContactSettings=(s:ContactSettings)=>setContactSettingsState(s);
 const texts=t[language]; const toggleFavorite=(id:string)=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]); const isFavorite=(id:string)=>favorites.includes(id);
 const cartCount=cart.reduce((s,x)=>s+x.quantity,0); const cartTotal=cart.reduce((s,x)=>s+((phones.find(p=>p.id===x.phoneId)?.price||0)*x.quantity),0); const isAdmin=user?.role==='admin';
 return <AppContext.Provider value={{language,setLanguage,texts,user,setUser,phones,categories,setPhones,favorites,toggleFavorite,isFavorite,cart,addToCart,removeFromCart,updateCartQty,clearCart,cartCount,cartTotal,contactSettings,setContactSettings,isAdmin}}>{children}</AppContext.Provider>;
};
export const useApp=()=>{const c=useContext(AppContext);if(!c)throw new Error('useApp must be used within AppProvider');return c;};
