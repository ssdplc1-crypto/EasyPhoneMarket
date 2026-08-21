import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContactSettings } from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CONTACT_KEY = '@fulatan_contact_settings_v1';
const CONTACT_DOC = 'appConfig/public';

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  phone: '',
  whatsapp: '',
  chatEnabled: true,
  callEnabled: true,
  whatsappEnabled: true,
  supportLabel: 'FULATAN COMMUNICATION',
  updatedAt: new Date(0).toISOString(),
};

export async function loadContactSettings(): Promise<ContactSettings> {
  try {
    if (isFirebaseConfigured) {
      const snap = await getDoc(doc(db, CONTACT_DOC));
      if (snap.exists()) return { ...DEFAULT_CONTACT_SETTINGS, ...snap.data() } as ContactSettings;
    }
    const raw = await AsyncStorage.getItem(CONTACT_KEY);
    if (!raw) return DEFAULT_CONTACT_SETTINGS;
    return { ...DEFAULT_CONTACT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTACT_SETTINGS;
  }
}

export async function saveContactSettings(settings: ContactSettings): Promise<void> {
  if (isFirebaseConfigured) await setDoc(doc(db, CONTACT_DOC), settings, { merge: true });
  await AsyncStorage.setItem(CONTACT_KEY, JSON.stringify(settings));
}
