// src/state/appStore.ts
import { create } from "zustand";
import { storage } from "../lib/storage";
import { todayKey } from "../lib/time";

// ---- Domain types ----
export type HabitId =
  | "morning-routine"
  | "screen-time"
  | "exercise"
  | "workout"
  | "eat-healthy"
  | "walk-10k";

export type Task = {
  id: string;
  text: string;
  minutes?: number;
  tip?: string;
};

export type DayPlan = {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  completed: Record<string, boolean>; // taskId -> done
};

export type UserProfile = {
  name?: string;
  goal?: string;
  // ✅ add habitId to profile so onboarding can store it
  habitId?: HabitId | null;
};

// ---- Store shape ----
type AppState = {
  profile: UserProfile;
  plans: Record<string, DayPlan>; // ✅ used by DailyChecklist

  // actions
  setProfile: (partial: Partial<UserProfile>) => void;
  ensureTodayPlan: () => DayPlan;
  toggleTask: (date: string, taskId: string) => void;
};

// ---- persistence helpers ----
const KEY = "fv@state";

function loadState(): Pick<AppState, "profile" | "plans"> {
  // our storage.get requires a fallback; provide a safe default
  return storage.get<Pick<AppState, "profile" | "plans">>(KEY, {
    profile: { name: "", goal: "", habitId: null },
    plans: {},
  });
}

function saveState(s: Pick<AppState, "profile" | "plans">) {
  storage.set(KEY, s);
}

// ---- initial data helpers ----
function defaultTasksForToday(): Task[] {
  return [
    { id: "t1", text: "2-min stretch after waking" },
    { id: "t2", text: "No phone at breakfast" },
    { id: "t3", text: "10-min evening walk" },
  ];
}

// ---- store ----
export const useApp = create<AppState>((set, get) => {
  const initial = loadState();

  return {
    profile: initial.profile,
    plans: initial.plans,

    setProfile: (partial) =>
      set((s) => {
        const next = { ...s, profile: { ...s.profile, ...partial } };
        saveState({ profile: next.profile, plans: next.plans });
        return next;
      }),

    ensureTodayPlan: () => {
      const s = get();
      const key = todayKey(new Date());
      const existing = s.plans[key];
      if (existing) return existing;

      const created: DayPlan = {
        date: key,
        tasks: defaultTasksForToday(),
        completed: {},
      };
      const plans = { ...s.plans, [key]: created };
      const next = { ...s, plans };
      saveState({ profile: next.profile, plans: next.plans });
      set(next);
      return created;
    },

    toggleTask: (date, taskId) =>
      set((s) => {
        const plan = s.plans[date];
        if (!plan) return s;
        const completed = { ...plan.completed, [taskId]: !plan.completed[taskId] };
        const updated: DayPlan = { ...plan, completed };
        const plans = { ...s.plans, [date]: updated };
        const next = { ...s, plans };
        saveState({ profile: next.profile, plans: next.plans });
        return next;
      }),
  };
});
