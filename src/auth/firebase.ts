import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAnYARJV5_QTgT1WzCeRVe6YBZhQW0zF9w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "ai-team2-ee3f6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "ai-team2-ee3f6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "ai-team2-ee3f6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "12903316326",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:12903316326:web:574107fe36620d8bed66a7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-FKB7B34Y19",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth: Auth = getAuth(firebaseApp);
export const firebaseDb: Firestore = getFirestore(firebaseApp);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((ok) => (ok ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }
  return analyticsPromise;
}
