// src/pages/HabitDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DietMealTracker from "@/components/DietMealTracker";
import {
  ymd,
  toggleDayDone,
  computeStreak,
  countLastNDays,
} from "@/lib/habits";

type HabitDoc = {
  uid: string;
  type: string;        // "eat_healthy" | "walking_10k" | "workout" | …
  name: string;
  answers?: Record<string, any>;
  createdAt?: any;
};

type HabitLog = {
  localDate: string;   // "YYYY-MM-DD"
  done?: boolean;
  ts?: number;
  meals?: {
    breakfast?: "yes" | "partial" | "no" | "skip";
    lunch?: "yes" | "partial" | "no" | "skip";
    dinner?: "yes" | "partial" | "no" | "skip";
  }
};

function daysBack(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function getMonthMatrix(refDate = new Date()) {
  // Returns a 6x7 matrix of Date objects for the calendar grid (Sun..Sat)
  const first = startOfMonth(refDate);
  const last = endOfMonth(refDate);
  const firstWeekday = first.getDay(); // 0=Sun .. 6=Sat

  const grid: Date[][] = [];
  const current = new Date(first);
  current.setDate(first.getDate() - firstWeekday); // back to previous Sunday (or same)

  for (let week = 0; week < 6; week++) {
    const row: Date[] = [];
    for (let day = 0; day < 7; day++) {
      row.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    grid.push(row);
  }
  return { grid, first, last };
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isYesterday(ref: Date, candidate: Date) {
  const y = daysBack(new Date(ref), 1);
  return isSameDay(y, candidate);
}

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [habit, setHabit] = useState<HabitDoc | null>(null);
  const [loadingHabit, setLoadingHabit] = useState(true);

  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

  // Live habit doc
  useEffect(() => {
    if (!user || !id) return;
    setLoadingHabit(true);
    setError(null);

    const ref = doc(db, "user_habits", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() as HabitDoc | undefined;
        if (!snap.exists() || !data || data.uid !== user.uid) {
          setHabit(null);
          setError("Habit not found.");
        } else {
          setHabit({ ...data });
        }
        setLoadingHabit(false);
      },
      (e) => {
        setError(e?.message || "Failed to load habit.");
        setLoadingHabit(false);
      }
    );
    return () => unsub();
  }, [user, id]);

  // Pull recent logs (last ~120 to cover a few months; cheap query)
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        setError(null);
        const ref = collection(db, "user_habits", id, "logs");
        const qRef = query(ref, orderBy("localDate", "desc"), limit(120));
        const snap = await getDocs(qRef);
        const data: HabitLog[] = [];
        snap.forEach((d) => data.push(d.data() as HabitLog));
        setLogs(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load logs.");
      }
    })();
  }, [user, id]);

  const today = new Date();
  const todayKey = ymd(today);

  const doneMap = useMemo(() => {
    const m = new Map<string, boolean>();
    logs.forEach((l) => m.set(l.localDate, !!l.done));
    return m;
  }, [logs]);

  const todayDone = !!doneMap.get(todayKey);
  const currentStreak = useMemo(() => computeStreak(doneMap, 365), [doneMap]);
  const weeklyCount = useMemo(() => countLastNDays(doneMap, 7), [doneMap]);

  // Toggle for a given date; only allows Today or Yesterday
  const toggleForDate = async (date: Date) => {
    if (!user || !id || saving) return;

    const allowToday = isSameDay(date, today);
    const allowYesterday = isYesterday(today, date);
    if (!allowToday && !allowYesterday) return;

    if (allowYesterday) {
      const ok = window.confirm(
        "Edit yesterday? You can only change yesterday (not older)."
      );
      if (!ok) return;
    }

    setSaving(true);
    setError(null);
    try {
      const nextDone = await toggleDayDone(id, date);
      const key = ymd(date);

      setLogs((prev) => {
        const idx = prev.findIndex((l) => l.localDate === key);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], done: nextDone, ts: Date.now() };
          return copy;
        }
        // if no doc existed, add one (e.g., first-time toggle)
        return [{ localDate: key, done: nextDone, ts: Date.now() }, ...prev];
      });
    } catch (e: any) {
      setError(e?.message || "Could not update day.");
    } finally {
      setSaving(false);
    }
  };

  const { grid, first, last } = useMemo(() => getMonthMatrix(today), [today]);
  const isInThisMonth = (d: Date) =>
    d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-6">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-3 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        {loadingHabit && (
          <Card className="bg-slate-900/70 border-slate-800 p-5">Loading habit…</Card>
        )}

        {!loadingHabit && !habit && (
          <Card className="bg-slate-900/70 border-slate-800 p-5">
            <h3 className="font-semibold">Not found</h3>
            <p className="text-slate-300 mt-1 text-sm">
              This habit doesn’t exist or you don’t have access.
            </p>
          </Card>
        )}

        {habit && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{habit.name}</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {habit.type.replaceAll?.("_", " ") ?? habit.type}
                </p>
              </div>

              {/* Reversible toggle for TODAY (button) */}
              <Button
                onClick={() => toggleForDate(today)}
                disabled={saving}
                className={todayDone ? "bg-amber-400 hover:bg-amber-300 text-black" : "bg-teal-500 hover:bg-teal-400 text-black"}
                title={todayDone ? "Undo today" : "Mark today done"}
              >
                {saving ? "Updating…" : todayDone ? "Undo today" : "Mark today done"}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/70 border-slate-800 p-4 text-center">
                <div className="text-xs text-slate-400">Current streak</div>
                <div className="mt-1 text-2xl font-bold">{currentStreak} days</div>
              </Card>
              <Card className="bg-slate-900/70 border-slate-800 p-4 text-center">
                <div className="text-xs text-slate-400">This week</div>
                <div className="mt-1 text-2xl font-bold">{weeklyCount}/7</div>
              </Card>
              <Card className="bg-slate-900/70 border-slate-800 p-4 text-center">
                <div className="text-xs text-slate-400">Today</div>
                <div className="mt-1 text-2xl font-bold">
                  {todayDone ? "✅" : "—"}
                </div>
              </Card>
            </div>

            {/* Diet tracker appears only for eat_healthy */}
            {habit.type === "eat_healthy" && (
              <Card className="bg-slate-900/70 border-slate-800 p-5">
                <DietMealTracker habitId={id!} />
              </Card>
            )}

            {/* Month calendar with dates & check states */}
            <Card className="bg-slate-900/70 border-slate-800 p-5 mt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {first.toLocaleString(undefined, { month: "long" })} {first.getFullYear()}
                </h3>
                <div className="text-xs text-slate-400">
                  Showing {first.toLocaleDateString()} – {last.toLocaleDateString()}
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-2">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => (
                  <div key={w} className="py-1">{w}</div>
                ))}
              </div>

              {/* 6x7 calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {grid.map((row, ri) =>
                  row.map((date, ci) => {
                    const key = ymd(date);
                    const inMonth = isInThisMonth(date);
                    const isDone = !!doneMap.get(key);
                    const isToday = isSameDay(date, today);
                    const wasYesterday = isYesterday(today, date);

                    const canEdit = isToday || wasYesterday;

                    const base =
                      "aspect-square rounded-lg border grid place-items-center relative overflow-hidden";
                    const tone = inMonth
                      ? isDone
                        ? "bg-emerald-500/20 border-emerald-500/40"
                        : "bg-slate-800/60 border-slate-700"
                      : "bg-slate-900/40 border-slate-800/60 opacity-60";

                    return (
                      <button
                        key={`${ri}-${ci}`}
                        type="button"
                        className={`${base} ${tone} ${canEdit ? "hover:ring-1 hover:ring-indigo-400/60" : "cursor-default"}`}
                        title={
                          canEdit
                            ? isToday
                              ? `${key}${isDone ? " • done" : ""} — click to toggle`
                              : `${key}${isDone ? " • done" : ""} — click to toggle (yesterday only)`
                            : `${key}${isDone ? " • done" : ""}`
                        }
                        disabled={!canEdit || saving}
                        onClick={() => toggleForDate(date)}
                      >
                        {/* Date number (top-left) */}
                        <div className="absolute top-1 left-1 text-[10px] text-slate-400">
                          {date.getDate()}
                        </div>
                        {/* State emoji */}
                        <div className="text-base">{isDone ? "✓" : ""}</div>
                        {/* Today ring */}
                        {isToday && (
                          <div className="absolute inset-0 ring-1 ring-indigo-400/60 rounded-lg pointer-events-none"></div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                You can toggle <strong>today</strong> instantly and <strong>yesterday</strong> with confirmation. Older dates are read-only.
              </p>
            </Card>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
              >
                {error}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
