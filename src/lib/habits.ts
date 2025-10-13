// src/lib/habits.ts
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Format a Date as YYYY-MM-DD (local). */
export function ymd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Set a given day to done/undone for a habit (idempotent merge). */
export async function setDayDone(habitId: string, date: Date, done: boolean) {
  const key = ymd(date);
  const ref = doc(db, "user_habits", habitId, "logs", key);
  await setDoc(
    ref,
    { localDate: key, done, ts: Date.now() },
    { merge: true }
  );
  return done;
}

/** Toggle done ↔ undone for a given day; returns the new boolean. */
export async function toggleDayDone(habitId: string, date: Date) {
  const key = ymd(date);
  const ref = doc(db, "user_habits", habitId, "logs", key);
  const snap = await getDoc(ref);
  const current = !!(snap.exists() && (snap.data() as any).done);
  const next = !current;
  await setDoc(
    ref,
    { localDate: key, done: next, ts: Date.now() },
    { merge: true }
  );
  return next;
}

/** Compute current streak from a map of YYYY-MM-DD → done. */
export function computeStreak(doneMap: Map<string, boolean>, maxDays = 365) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (doneMap.get(ymd(d))) streak++;
    else break;
  }
  return streak;
}

/** Count how many days done in the last N days (default 7). */
export function countLastNDays(doneMap: Map<string, boolean>, n = 7) {
  const today = new Date();
  let cnt = 0;
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (doneMap.get(ymd(d))) cnt++;
  }
  return cnt;
}
