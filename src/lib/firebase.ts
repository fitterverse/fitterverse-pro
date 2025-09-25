// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// If you want Analytics later, use guarded import to avoid SSR/dev issues:
// import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
};

// Avoid re-initializing during Vite HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth (used by Google / Phone OTP)
export const auth = getAuth(app);

// Optional: enable Analytics later if you want
// if (import.meta.env.PROD && typeof window !== "undefined") {
//   isSupported().then((ok) => {
//     if (ok) getAnalytics(app);
//   });
// }
