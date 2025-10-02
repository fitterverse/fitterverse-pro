// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-rMRXQ_iSvOF8NS-PcItEGh-iQ8U-kCs",
  authDomain: "fitterverse.firebaseapp.com",
  projectId: "fitterverse",
  storageBucket: "fitterverse.firebasestorage.app",
  messagingSenderId: "46698969942",
  appId: "1:46698969942:web:982e736a4e2223cb9734f7",
  measurementId: "G-BF77DDV8SD"
};

// avoid double init during Vite HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// optional analytics, non-blocking
if (typeof window !== "undefined") {
  (async () => {
    try {
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      if (await isSupported()) getAnalytics(app);
    } catch {}
  })();
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
