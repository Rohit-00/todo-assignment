import { initializeApp,getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence,inMemoryPersistence,browserLocalPersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyDvbgxaSIT0vP6M4_LZPgY6SC-siImJSXo",
  authDomain: "todo-f16da.firebaseapp.com",
  projectId: "todo-f16da",
  storageBucket: "todo-f16da.firebasestorage.app",
  messagingSenderId: "250983820341",
  appId: "1:250983820341:web:0c9a40011274f3a2a9957c",
  measurementId: "G-270W7Z23XG"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) 
  });
const db = getFirestore(app);
export default app;
export { auth };
export { db };