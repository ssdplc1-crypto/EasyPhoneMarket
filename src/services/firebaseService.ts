import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, isFirebaseConfigured } from './firebase';
import { Phone, User, Message, Chat } from '../types';
import { mockPhones, mockUsers } from './mockData';

// ==================== AUTH ====================

export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    // Mock mode
    const user: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      phone,
      joinedAt: new Date().toISOString().split('T')[0],
      rating: 5,
      totalSales: 0,
    };
    return user;
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const userData: User = {
    id: cred.user.uid,
    name,
    email,
    phone,
    joinedAt: new Date().toISOString().split('T')[0],
    rating: 5,
    totalSales: 0,
  };

  await setDoc(doc(db, 'users', cred.user.uid), userData);
  return userData;
}

export async function loginUser(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    const found = mockUsers.find((u) => u.email === email || u.phone === email);
    if (found) return found;
    throw new Error('User not found (mock mode)');
  }

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  if (snap.exists()) {
    return snap.data() as User;
  }
  throw new Error('User profile not found');
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured) {
    await signOut(auth);
  }
}

// ==================== PHONES ====================

export async function fetchPhones(): Promise<Phone[]> {
  if (!isFirebaseConfigured) {
    return mockPhones;
  }

  const q = query(collection(db, 'phones'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Phone));
}

export async function postPhone(
  phoneData: Omit<Phone, 'id' | 'createdAt' | 'views'>,
  imageUris: string[]
): Promise<Phone> {
  // Upload images first
  const imageUrls: string[] = [];

  if (isFirebaseConfigured && imageUris.length > 0) {
    for (const uri of imageUris) {
      const url = await uploadImage(uri, `phones/${Date.now()}_${Math.random()}.jpg`);
      imageUrls.push(url);
    }
  } else {
    // Mock - use the local uri or placeholder
    imageUrls.push(...(imageUris.length ? imageUris : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400']));
  }

  const newPhone: Omit<Phone, 'id'> = {
    ...phoneData,
    images: imageUrls,
    createdAt: new Date().toISOString().split('T')[0],
    views: 0,
  };

  if (!isFirebaseConfigured) {
    return { id: 'p_' + Date.now(), ...newPhone };
  }

  const docRef = await addDoc(collection(db, 'phones'), newPhone);
  return { id: docRef.id, ...newPhone };
}

async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

// ==================== CHAT ====================

export async function createOrGetChat(
  phoneId: string,
  phoneTitle: string,
  buyerId: string,
  sellerId: string
): Promise<string> {
  if (!isFirebaseConfigured) {
    return `chat_${phoneId}_${buyerId}`;
  }

  // Check if chat already exists
  const q = query(
    collection(db, 'chats'),
    where('phoneId', '==', phoneId),
    where('buyerId', '==', buyerId),
    where('sellerId', '==', sellerId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const chatData = {
    phoneId,
    phoneTitle,
    buyerId,
    sellerId,
    lastMessage: '',
    updatedAt: serverTimestamp(),
    unreadCount: 0,
  };
  const docRef = await addDoc(collection(db, 'chats'), chatData);
  return docRef.id;
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    return; // handled in local state
  }

  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });

  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
) {
  if (!isFirebaseConfigured) {
    return () => {};
  }

  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        chatId,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        read: data.read,
      } as Message;
    });
    callback(messages);
  });
}
