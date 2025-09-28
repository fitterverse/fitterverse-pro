// src/lib/db.ts
import { app } from "./firebase";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

export const db = getFirestore(app);

// paths
export const userDoc = (uid: string) => doc(db, "users", uid);
export const profileDoc = (uid: string) => doc(db, "users", uid, "meta", "profile");
export const checkinsCol = (uid: string) => collection(db, "users", uid, "checkins");
export const weeklyReviewsCol = (uid: string) => collection(db, "users", uid, "weeklyReviews");

// helpers
export async function getProfile(uid: string) {
  const snap = await getDoc(profileDoc(uid));
  return snap.exists() ? snap.data() as any : null;
}

export async function saveProfile(uid: string, data: any) {
  await setDoc(profileDoc(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export async function getLastNCheckins(uid: string, n = 7) {
  const q = query(checkinsCol(uid), orderBy("date", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    date: string;
    completed: Record<string, boolean>;
  }>;
}

export async function saveCheckin(uid: string, date: string, payload: { completed: Record<string, boolean>; note?: string }) {
  const ref = doc(checkinsCol(uid), date);
  await setDoc(ref, { date, ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

export async function addWeeklyReview(uid: string, payload: { weekEnding: string; score: number; note?: string }) {
  await addDoc(weeklyReviewsCol(uid), { ...payload, createdAt: serverTimestamp() });
}

export type Profile = {
  uid: string;
  habitId: string;
  habitName: string;
  plan: {
    tasks: Array<{ id: string; text: string; minutes?: number }>;
  };
  preferences?: {
    dailyTracking?: boolean;
  };
  createdAt?: Timestamp | number;
  updatedAt?: Timestamp | number;
};
