import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactSettings } from '../types';
import { loadContactSettings as apiLoad, saveContactSettings as apiSave, isApiConfigured } from './api';
const CONTACT_KEY='@fulatan_contact_settings_v2';
export const DEFAULT_CONTACT_SETTINGS:ContactSettings={phone:'',whatsapp:'',chatEnabled:true,callEnabled:true,whatsappEnabled:true,supportLabel:'FULATAN COMMUNICATION',updatedAt:new Date(0).toISOString()};
export async function loadContactSettings(){if(!isApiConfigured) throw new Error('FULATAN API is not configured'); return {...DEFAULT_CONTACT_SETTINGS,...await apiLoad()};}
export async function saveContactSettings(settings:ContactSettings){if(!isApiConfigured) throw new Error('FULATAN API is not configured'); await apiSave(settings);}
