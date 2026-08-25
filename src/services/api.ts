import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Phone, User, Message, ContactSettings, Category } from '../types';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = '@fulatan_api_token_v2';

export const isApiConfigured = Boolean(API_URL);
async function token(){ try{const value=await SecureStore.getItemAsync(TOKEN_KEY);return value||AsyncStorage.getItem(TOKEN_KEY);}catch{return AsyncStorage.getItem(TOKEN_KEY);} }
async function saveToken(value:string){ try{await SecureStore.setItemAsync(TOKEN_KEY,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY});}catch{await AsyncStorage.setItem(TOKEN_KEY,value);} }
async function clearToken(){ try{await SecureStore.deleteItemAsync(TOKEN_KEY);}catch{} await AsyncStorage.removeItem(TOKEN_KEY); }
async function request(path:string, options:RequestInit={}){
  if(!API_URL) throw new Error('FULATAN API is not configured. Set EXPO_PUBLIC_API_URL.');
  const t=await token();
  const headers:any={...(options.headers||{})};
  if(!(options.body instanceof FormData)) headers['Content-Type']='application/json';
  if(t) headers.Authorization=`Bearer ${t}`;
  const res=await fetch(`${API_URL}${path}`,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message||`Request failed (${res.status})`);
  return data;
}
export async function registerUser(name:string,email:string,phone:string,password:string,referralCode?:string,otpChannel:'email'|'sms'='email'){return request('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,phone,password,referralCode:referralCode?.trim()||undefined,otpChannel})});}
export async function verifyRegistrationOtp(verificationId:string,otp:string):Promise<User>{const d=await request('/api/auth/register/verify',{method:'POST',body:JSON.stringify({verificationId,otp})});await saveToken(d.token);return d.user;}
export async function resendRegistrationOtp(verificationId:string){return request('/api/auth/register/resend',{method:'POST',body:JSON.stringify({verificationId})});}
export async function loginUser(emailOrPhone:string,password:string):Promise<User>{const d=await request('/api/auth/login',{method:'POST',body:JSON.stringify({emailOrPhone,password})});await saveToken(d.token);return d.user;}
export async function logoutUser(){await clearToken();}
export async function getCurrentUser():Promise<User|null>{try{const t=await token();if(!t)return null;const d=await request('/api/me');return d.user||null;}catch{await clearToken();return null;}}
export async function fetchPhones():Promise<Phone[]>{return request('/api/phones');}
export async function fetchCategories():Promise<Category[]>{return request('/api/categories');}
export async function fetchAllPhonesAdmin():Promise<Phone[]>{return request('/api/admin/phones');}
export async function postPhone(phoneData:Omit<Phone,'id'|'createdAt'|'views'>,imageUris:string[]):Promise<Phone>{const form=new FormData();Object.entries({...phoneData,images:undefined}).forEach(([k,v])=>{if(k!=='images'&&v!==undefined)form.append(k,String(v));});for(const uri of imageUris){const name=uri.split('/').pop()||`phone-${Date.now()}.jpg`;form.append('images',{uri,name,type:'image/jpeg'} as any);}return request('/api/phones',{method:'POST',body:form});}
export async function deletePhone(id:string){return request(`/api/phones/${id}`,{method:'DELETE'});}
export async function setPhonePublished(id:string,isPublished:boolean){return request(`/api/phones/${id}`,{method:'PATCH',body:JSON.stringify({isPublished})});}
export async function createOrGetChat(phoneId:string,phoneTitle:string,buyerId:string,sellerId:string){const d=await request('/api/chats',{method:'POST',body:JSON.stringify({phoneId,phoneTitle,sellerId})});return d.id;}
export async function sendMessage(chatId:string,senderId:string,text:string){return request(`/api/chats/${chatId}/messages`,{method:'POST',body:JSON.stringify({text})});}
export async function fetchMessages(chatId:string):Promise<Message[]>{return request(`/api/chats/${chatId}/messages`);}
export function subscribeToMessages(chatId:string,callback:(messages:Message[])=>void){let stopped=false;const poll=async()=>{try{if(!stopped)callback(await fetchMessages(chatId));}catch{}if(!stopped)setTimeout(poll,3000);};poll();return()=>{stopped=true;};}
export async function loadContactSettings():Promise<ContactSettings>{return request('/api/settings/contact');}
export async function saveContactSettings(settings:ContactSettings){return request('/api/settings/contact',{method:'PUT',body:JSON.stringify(settings)});}
export async function createOrder(items:{phoneId:string;quantity:number}[],data:{deliveryAddress:string;phoneNumber:string;buyerName:string;buyerEmail:string;deliveryState:string;deliveryLga:string;deliveryLandmark:string;deliveryMethod:'delivery'|'pickup'}){return request('/api/orders',{method:'POST',body:JSON.stringify({items,...data})});}
export async function fetchMyOrders(){return request('/api/orders');}
export async function fetchReferral(){return request('/api/referral/me');}
export async function fetchAdminStats(){return request('/api/admin/stats');}
export async function fetchAdminOrders(){return request('/api/admin/orders');}
export async function updateAdminOrderStatus(id:string,status:string){return request(`/api/admin/orders/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});}
export async function fetchAdminReferrals(){return request('/api/admin/referrals');}
