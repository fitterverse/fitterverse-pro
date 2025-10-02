// src/state/habitStore.ts
import { create } from "zustand";
import { db } from "@/lib/firebase";
import {
  collection, doc, addDoc, getDocs, query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { HabitKind } from "@/types/habits";
import { User } from "firebase/auth";

export type Habit = {
  id: string;
  userId: string;
  kind: HabitKind;
  label: string;
  emoji?: string;
  answers: Record<string, any>;
  createdAt?: any;
};

type HabitState = {
  habits: Habit[];
  loading: boolean;
  error?: string;

  fetchHabits: (user: User) => Promise<void>;
  createHabit: (user: User, input: Omit<Habit, "id" | "createdAt" | "userId">) => Promise<string>;
};

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,
  error: undefined,

  fetchHabits: async (user) => {
    if (!user) return;
    try {
      set({ loading: true, error: undefined });
      const ref = collection(db, "users", user.uid, "habits");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list: Habit[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      set({ habits: list });
    } catch (e: any) {
      set({ error: e?.message ?? "Failed to load habits" });
    } finally {
      set({ loading: false });
    }
  },

  createHabit: async (user, input) => {
    const ref = collection(db, "users", user.uid, "habits");
    const payload = {
      ...input,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };
    const added = await addDoc(ref, payload);
    // refresh list quickly
    const { fetchHabits } = get();
    fetchHabits(user);
    return added.id;
  },
}));
