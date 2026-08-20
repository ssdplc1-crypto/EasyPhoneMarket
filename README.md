# Easy Phone Market 📱

**App na sayen da sayar da wayoyi cikin sauƙi**  
Easy Buy & Sell Phone App for Android & iOS

---

## ✅ Features (Duka)

| Feature | Status |
|---------|--------|
| Home + Search + Brand Filter | ✅ |
| Phone Details | ✅ |
| Call Seller | ✅ |
| WhatsApp Seller | ✅ |
| **In-App Chat** | ✅ |
| Post Phone for Sale | ✅ |
| **Upload Photos (Camera + Gallery)** | ✅ |
| Favorites / Wishlist | ✅ |
| Login & Register | ✅ |
| **Firebase Ready** (Auth + Firestore + Storage) | ✅ |
| Profile + Language Switch (Hausa/English) | ✅ |
| Modern UI | ✅ |

---

## 🚀 Yadda za ka gudanar (How to Run)

### 1. Shiga folder
```bash
cd EasyPhoneMarket
```

### 2. Install packages
```bash
npm install
```

### 3. Fara app
```bash
npx expo start
```

### 4. Gwada a wayarka
- Sauke **Expo Go** daga Play Store ko App Store
- Scan QR code

---

## 🔥 Yadda za ka haɗa Firebase (Optional amma Recommended)

1. Je ka → [Firebase Console](https://console.firebase.google.com)
2. Create Project → **EasyPhoneMarket**
3. Add App (Android + iOS)
4. Enable:
   - **Authentication** → Email/Password
   - **Firestore Database**
   - **Storage**
5. Buɗe file: `src/services/firebase.ts`
6. Paste config ɗinka:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123456:web:abc"
};
```

7. Restart app → Real login, database, and image upload will work!

> **Note:** Without Firebase config, the app still works perfectly with **Mock Data**.

---

## 📁 Project Structure

```
EasyPhoneMarket/
├── App.tsx
├── src/
│   ├── components/     → PhoneCard
│   ├── constants/      → Colors, Brands, Translations
│   ├── context/        → App state (language, user, favorites)
│   ├── navigation/     → Stack + Tabs
│   ├── screens/        → All screens
│   ├── services/       → Firebase + Mock data
│   └── types/          → TypeScript types
```

---

## 🛠 Tech Stack

- Expo SDK 57 + React Native
- TypeScript
- React Navigation 7
- Firebase (Auth, Firestore, Storage)
- Expo Image Picker

---

## Next Improvements (Optional)

- [ ] Push Notifications
- [ ] Commission / Payment system
- [ ] Seller ratings & reviews
- [ ] Admin panel
- [ ] Location-based search (nearby)

---

Made with ❤️ for the Nigerian phone market
