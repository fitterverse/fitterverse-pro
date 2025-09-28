// src/lib/profile.ts
export type Baseline = {
  goal: "Lose weight" | "Build muscle" | "Get consistent" | "Boost energy" | "";
  experience: "Beginner" | "Intermediate" | "Advanced" | "";
};

export type Habit = {
  id: string;
  title: string;
  description: string;
};

export type Schedule = {
  timeOfDay: "Morning" | "Afternoon" | "Evening" | "";
  reminders: boolean;
};

export type WeeklyCheckin = {
  weekId: string;         // e.g. "2025-W39"
  createdAt: number;      // epoch ms
  rating: 1 | 2 | 3 | 4 | 5;
  q1Consistency: string;  // free text
  q2Blockers: string;     // free text
  q3NextWeek: string;     // free text
};

export type Profile = {
  uid: string | null;
  baseline: Baseline;
  habit: Habit | null;
  schedule: Schedule;
  preferences?: {
    dailyTracking?: boolean; // user can toggle
  };
  weekly: WeeklyCheckin[];
  createdAt: number;
};

const PROFILE_KEY = "fv:profile";
const ONBOARDED_KEY = "fv:onboarded";

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}

export function updateProfile(mutator: (p: Profile) => void): Profile | null {
  const p = getProfile();
  if (!p) return null;
  mutator(p);
  saveProfile(p);
  return p;
}

export function isOnboarded(uid?: string | null): boolean {
  try {
    const raw = localStorage.getItem(ONBOARDED_KEY);
    if (!raw) return false;
    const obj = JSON.parse(raw) as Record<string, boolean>;
    return !!obj[(uid ?? "anon")];
  } catch {
    return false;
  }
}

export function markOnboarded(uid?: string | null) {
  try {
    const raw = localStorage.getItem(ONBOARDED_KEY);
    const obj = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    obj[(uid ?? "anon")] = true;
    localStorage.setItem(ONBOARDED_KEY, JSON.stringify(obj));
  } catch {}
}

/** Get ISO week id like "2025-W39" for a date (local time) */
export function weekIdFor(date = new Date()): string {
  // ISO week (Mon-based). Simple approach good enough for app use.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

/** Add/replace a weekly check-in */
export function upsertWeeklyCheckin(entry: WeeklyCheckin) {
  updateProfile((p) => {
    const i = p.weekly.findIndex((w) => w.weekId === entry.weekId);
    if (i >= 0) p.weekly[i] = entry;
    else p.weekly.unshift(entry);
  });
}
