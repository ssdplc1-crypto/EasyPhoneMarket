import AsyncStorage from '@react-native-async-storage/async-storage';
import { Phone, User, Message, ContactSettings, Category } from '../types';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = '@fulatan_api_token_v1';

export const isApiConfigured = Boolean(API_URL);

async function token(){ return AsyncStorage.getItem(TOKEN_KEY); }
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
export async function registerUser(name:string,email:string,phone:string,password:string):Promise<User>{const d=await request('/api/auth/register',{method:'POST',body:JSON.stringify({name,email,phone,password})});await AsyncStorage.setItem(TOKEN_KEY,d.token);return d.user;}
export async function loginUser(emailOrPhone:string,password:string):Promise<User>{const d=await request('/api/auth/login',{method:'POST',body:JSON.stringify({emailOrPhone,password})});await AsyncStorage.setItem(TOKEN_KEY,d.token);return d.user;}
export async function logoutUser(){await AsyncStorage.removeItem(TOKEN_KEY);}
export async function fetchPhones():Promise<Phone[]>{return request('/api/phones');}
export async function fetchCategories():Promise<Category[]>{return request('/api/categories');}
export async function fetchAllPhonesAdmin():Promise<Phone[]>{return request('/api/admin/phones');}
export async function postPhone(phoneData:Omit<Phone,'id'|'createdAt'|'views'>,imageUris:string[]):Promise<Phone>{const form=new FormData();Object.entries({...phoneData,images:undefined}).forEach(([k,v])=>{if(k!=='images'&&v!==undefined)form.append(k,String(v));});for(const uri of imageUris){const name=uri.split('/').pop()||`phone-${Date.now()}.jpg`;form.append('images',{uri,name,type:'image/jpeg'} as any);}return request('/api/phones',{method:'POST',body:form});}
export async function deletePhone(id:string){await request(`/api/phones/${id}`,{method:'DELETE'});}
export async function setPhonePublished(id:string,isPublished:boolean){return request(`/api/phones/${id}`,{method:'PATCH',body:JSON.stringify({isPublished})});}
export async function createOrGetChat(phoneId:string,phoneTitle:string,buyerId:string,sellerId:string){const d=await request('/api/chats',{method:'POST',body:JSON.stringify({phoneId,phoneTitle,sellerId})});return d.id;}
export async function sendMessage(chatId:string,senderId:string,text:string){return request(`/api/chats/${chatId}/messages`,{method:'POST',body:JSON.stringify({text})});}
export async function fetchMessages(chatId:string):Promise<Message[]>{return request(`/api/chats/${chatId}/messages`);}
export function subscribeToMessages(chatId:string,callback:(messages:Message[])=>void){let stopped=false;const poll=async()=>{try{if(!stopped)callback(await fetchMessages(chatId));}catch{} if(!stopped)setTimeout(poll,3000);};poll();return()=>{stopped=true;};}
export async function loadContactSettings():Promise<ContactSettings>{return request('/api/settings/contact');}
export async function saveContactSettings(settings:ContactSettings){return request('/api/settings/contact',{method:'PUT',body:JSON.stringify(settings)});}

export async function createOrder(items:{phoneId:string;quantity:number}[],deliveryAddress:string,phoneNumber:string){return request('/api/orders',{method:'POST',body:JSON.stringify({items,deliveryAddress,phoneNumber})});}
