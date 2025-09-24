// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-rMRXQ_iSvOF8NS-PcItEGh-iQ8U-kCs",
  authDomain: "fitterverse.firebaseapp.com",
  projectId: "fitterverse",
  storageBucket: "fitterverse.firebasestorage.app",
  messagingSenderId: "46698969942",
  appId: "1:46698969942:web:982e736a4e2223cb9734f7",
  measurementId: "G-BF77DDV8SD",
};

// avoid re-initializing during HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth (we’ll add analytics later once everything loads fine)
export const auth = getAuth(app);
export default app;
