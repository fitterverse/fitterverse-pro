// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { app } from "@/lib/firebase"; // your existing web SDK init

// -----------------------------
// Types matching seed script
// -----------------------------
type ProfileDoc = {
  baseline?: { goal?: string; experience?: string };
  preferences?: { dailyTracking?: boolean; notifications?: boolean; timezone?: string; weeklyReviewDay?: number };
  schedule?: { timeOfDay?: string; reminders?: boolean };
  avatar?: string;
  tags?: string[];
};

type UserDoc = {
  name?: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  createdAt?: Timestamp;
  lastActiveAt?: Timestamp;
  inOnboarding?: boolean;
  planId?: string;
};

type HabitDoc = {
  name: string;
  targetPerWeek: number;
  unit: string; // "mins" | "count"
  streak?: number;
  longestStreak?: number;
  totalCompletions?: number;
  color?: string;
};

type CheckinEntry = { habitId: string; value: number };
type CheckinDoc = {
  date: string; // "YYYY-MM-DD"
  entries: CheckinEntry[];
  mood?: number;
  energy?: number;
  createdAt?: Timestamp;
};

type RollupsDoc = {
  last7?: { daysCompleted?: number; minutes?: number; streak?: number };
  last30?: { daysCompleted?: number; minutes?: number };
  allTime?: { daysCompleted?: number; minutes?: number };
};

// -----------------------------
// Utilities
// -----------------------------
const db = getFirestore(app);

function todayKey(tz = "default") {
  // If you store TZ in profile, pass that here. Using local as default.
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function lastNDates(n: number): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const dt = new Date(d);
    dt.setDate(d.getDate() - (n - 1 - i));
    const yyyy = dt.getFullYear();
    const mm = `${dt.getMonth() + 1}`.padStart(2, "0");
    const dd = `${dt.getDate()}`.padStart(2, "0");
    days.push(`${yyyy}-${mm}-${dd}`);
  }
  return days;
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

// Quick inline sparkline
function Sparkline({ points }: { points: number[] }) {
  const width = 220;
  const height = 56;
  const max = Math.max(1, ...points);
  const step = width / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = height - (v / max) * height;
      return `${i === 0 ? "M" : "L"} ${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke="currentColor" className="text-teal-400" strokeWidth="2" />
    </svg>
  );
}

// -----------------------------
// Main
// -----------------------------
export default function Dashboard() {
  const { user } = useAuth();
  const uid = user?.uid || null;

  const [loading, setLoading] = useState(true);
  const [u, setU] = useState<UserDoc | null>(null);
  const [profile, setProfile] = useState<ProfileDoc | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Record<string, HabitDoc>>({});
  const [checkins, setCheckins] = useState<CheckinDoc[]>([]);
  const [rollups, setRollups] = useState<RollupsDoc | null>(null);
  const [busyMark, setBusyMark] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!uid) return;
      setLoading(true);

      // user doc
      const uRef = doc(db, "users", uid);
      const uSnap = await getDoc(uRef);
      const userDoc = (uSnap.exists() ? (uSnap.data() as UserDoc) : {}) || {};
      if (cancelled) return;
      setU(userDoc);
      setPlanId(userDoc.planId ?? null);

      // profile
      const pRef = doc(db, "users", uid, "meta", "profile");
      const pSnap = await getDoc(pRef);
      if (!cancelled) setProfile(pSnap.exists() ? (pSnap.data() as ProfileDoc) : null);

      // rollups
      const rRef = doc(db, "users", uid, "analytics", "rollups");
      const rSnap = await getDoc(rRef);
      if (!cancelled) setRollups(rSnap.exists() ? (rSnap.data() as RollupsDoc) : null);

      // habits (if planId is present)
      if (userDoc.planId) {
        const hCol = collection(db, "users", uid, "plans", userDoc.planId, "habits");
        const hSnap = await getDocs(hCol);
        const h: Record<string, HabitDoc> = {};
        hSnap.forEach((d) => (h[d.id] = d.data() as HabitDoc));
        if (!cancelled) setHabits(h);
      }

      // last 30 checkins (ordered newest first)
      const cQ = query(collection(db, "users", uid, "checkins"), orderBy("date", "desc"), limit(30));
      const cSnap = await getDocs(cQ);
      const c: CheckinDoc[] = [];
      cSnap.forEach((d) => c.push(d.data() as CheckinDoc));
      if (!cancelled) setCheckins(c);

      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Build last-7 aggregated array
  const last7Series = useMemo(() => {
    const days = lastNDates(7);
    const map: Record<string, number> = {};
    for (const c of checkins) {
      map[c.date] = sum(c.entries.map((e) => e.value > 0 ? 1 : 0)); // count #habits ticked that day
    }
    return days.map((day) => map[day] ?? 0);
  }, [checkins]);

  const today = useMemo(() => todayKey(profile?.preferences?.timezone), [profile]);

  async function markDone(habitId: string, defaultValue = 1) {
    if (!uid || !planId) return;
    setBusyMark(habitId);
    try {
      const ckRef = doc(db, "users", uid, "checkins", today);
      const existing = await getDoc(ckRef);
      let entries: CheckinEntry[] = [];
      if (existing.exists()) entries = (existing.data() as CheckinDoc).entries || [];

      // upsert/accumulate per habit for the day
      const idx = entries.findIndex((e) => e.habitId === habitId);
      if (idx >= 0) entries[idx] = { habitId, value: entries[idx].value + defaultValue };
      else entries.push({ habitId, value: defaultValue });

      await setDoc(
        ckRef,
        {
          date: today,
          createdAt: Timestamp.now(),
          entries,
        },
        { merge: true }
      );

      // optimistic update in UI
      setCheckins((prev) => {
        const copy = [...prev];
        const i = copy.findIndex((x) => x.date === today);
        if (i >= 0) copy[i] = { ...copy[i], entries: entries };
        else copy.unshift({ date: today, entries, createdAt: Timestamp.now() });
        return copy;
      });
    } finally {
      setBusyMark(null);
    }
  }

  if (!uid) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <Card className="bg-slate-900/70 border-slate-800 max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-semibold">You’re signed out</h1>
          <p className="mt-2 text-slate-300">Please sign in to view your dashboard.</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-teal-500 text-black px-5 py-2.5 hover:bg-teal-400"
          >
            Go to Home
          </Link>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse grid gap-4">
            <div className="h-8 w-40 bg-slate-800 rounded" />
            <div className="h-24 bg-slate-800 rounded" />
            <div className="h-40 bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    u?.name ||
    (u?.email ? u.email.split("@")[0] : "Friend");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="px-4 sm:px-6 md:px-10 py-6 max-w-6xl mx-auto">
        {/* Greeting + rollup */}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {displayName} 👋</h1>
          {rollups?.last7?.streak != null && (
            <p className="text-slate-300">
              Current streak: <span className="text-teal-400 font-semibold">{rollups.last7.streak} days</span>
            </p>
          )}
        </div>

        {/* Today quick actions */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Today — {today}</h2>
          <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(habits).length === 0 && (
              <Card className="bg-slate-900/60 border-slate-800 p-4">
                <p className="text-slate-300">No habits found in your active plan.</p>
              </Card>
            )}
            {Object.entries(habits).map(([id, h]) => {
              const already = checkins.find((c) => c.date === today)?.entries?.some((e) => e.habitId === id);
              return (
                <Card key={id} className="bg-slate-900/60 border-slate-800 p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm text-slate-400">Habit</div>
                    <div className="font-medium truncate">{h.name}</div>
                  </div>
                  <Button
                    disabled={!!busyMark || already}
                    onClick={() => markDone(id, h.unit === "mins" ? 10 : 1)}
                    className={`ml-3 ${already ? "bg-slate-700 text-slate-300" : "bg-teal-500 text-black hover:bg-teal-400"}`}
                  >
                    {already ? "Logged" : "Mark done"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Last 7 trend */}
        <section className="mt-8">
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Last 7 days</h3>
                <div className="text-sm text-slate-400">
                  Total days completed:{" "}
                  <span className="text-teal-400 font-semibold">{last7Series.filter((x) => x > 0).length}</span>
                </div>
              </div>
              <div className="mt-4">
                <Sparkline points={last7Series} />
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {lastNDates(7).map((d, i) => (
                  <div key={d} className="text-center">
                    <div
                      className={`h-8 rounded ${
                        last7Series[i] > 0 ? "bg-teal-500" : "bg-slate-700"
                      }`}
                      title={`${d}: ${last7Series[i]} habits`}
                    />
                    <div className="mt-1 text-[10px] text-slate-400">{d.slice(5)}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* Habits summary */}
        <section className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Your habits</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(habits).map(([id, h]) => (
              <Card key={id} className="bg-slate-900/60 border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{h.name}</div>
                  <span className="text-xs rounded-full px-2 py-0.5" style={{ background: `${h.color ?? "#334155"}` }}>
                    {h.unit}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-semibold">{h.streak ?? 0}</div>
                    <div className="text-[11px] text-slate-400">Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{h.longestStreak ?? 0}</div>
                    <div className="text-[11px] text-slate-400">Longest</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{h.totalCompletions ?? 0}</div>
                    <div className="text-[11px] text-slate-400">Total</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Weekly review CTA */}
        <section className="mt-8">
          <Card className="bg-slate-900/60 border-slate-800">
            <div className="p-4 sm:p-6 md:flex md:items-center md:justify-between">
              <div className="max-w-xl">
                <h3 className="font-semibold">Weekly review</h3>
                <p className="text-slate-300 mt-1">
                  Reflect for 2 minutes, rate your week (1–5), and decide the next small improvement.
                </p>
              </div>
              <Link
                to="/weekly-review"
                className="inline-flex mt-3 md:mt-0 rounded-xl bg-white text-slate-900 px-4 py-2.5 hover:bg-white/90"
              >
                Start review
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
