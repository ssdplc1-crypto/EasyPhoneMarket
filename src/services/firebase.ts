// ============================================
// FIREBASE CONFIGURATION
// ============================================
// 1. Je ka https://console.firebase.google.com
// 2. Create new project → "EasyPhoneMarket"
// 3. Add Android/iOS app
// 4. Copy config values and paste below
// 5. Enable Authentication → Email/Password + Phone
// 6. Enable Firestore Database
// 7. Enable Storage (for images)
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️ REPLACE THESE WITH YOUR REAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

// Auth with persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

// Flag to know if Firebase is configured
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
