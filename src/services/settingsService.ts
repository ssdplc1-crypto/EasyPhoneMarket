import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactSettings } from '../types';
import { loadContactSettings as apiLoad, saveContactSettings as apiSave, isApiConfigured } from './api';
const CONTACT_KEY='@fulatan_contact_settings_v2';
export const DEFAULT_CONTACT_SETTINGS:ContactSettings={phone:'',whatsapp:'',chatEnabled:true,callEnabled:true,whatsappEnabled:true,supportLabel:'FULATAN COMMUNICATION',updatedAt:new Date(0).toISOString()};
export async function loadContactSettings(){try{if(isApiConfigured)return {...DEFAULT_CONTACT_SETTINGS,...await apiLoad()};}catch{} const raw=await AsyncStorage.getItem(CONTACT_KEY);return raw?{...DEFAULT_CONTACT_SETTINGS,...JSON.parse(raw)}:DEFAULT_CONTACT_SETTINGS;}
export async function saveContactSettings(settings:ContactSettings){try{if(isApiConfigured)await apiSave(settings);}catch{} await AsyncStorage.setItem(CONTACT_KEY,JSON.stringify(settings));}
