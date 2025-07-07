import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// UWAGA: Te klucze powinny być w zmiennych środowiskowych (.env)
const firebaseConfig = {
  apiKey: "AIzaSyC6L-8owWH1z6Ipf2FZax7gZ7FQOvuSNJs",
  authDomain: "evshop-6719a.firebaseapp.com",
  projectId: "evshop-6719a",
  storageBucket: "evshop-6719a.appspot.com",
  messagingSenderId: "619247072748",
  appId: "1:619247072748:web:ad274f442dba53736cbcc9",
  measurementId: "G-Z80X8YRR4L"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;