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
  setDoc,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/state/authStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type HabitDoc = {
  uid: string;
  name: string;
  type: string;
  answers?: any;
  createdAt?: any;
};

type HabitLog = {
  localDate: string; // YYYY-MM-DD
  done: boolean;
  ts?: any;
};

function formatYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBack(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
}

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [habit, setHabit] = useState<HabitDoc | null>(null);
  const [loadingHabit, setLoadingHabit] = useState(true);

  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [savingToday, setSavingToday] = useState(false);
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

  // Pull recent logs (last ~30 days)
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      try {
        setError(null);
        const thirtyDaysAgo = formatYMD(daysBack(new Date(), 29));
        const logsRef = collection(db, "user_habits", id, "logs");
        const q = query(
          logsRef,
          where("localDate", ">=", thirtyDaysAgo),
          orderBy("localDate", "desc"),
          limit(60)
        );
        const snap = await getDocs(q);
        const rows: HabitLog[] = [];
        snap.forEach((d) => rows.push(d.data() as HabitLog));
        rows.sort((a, b) => (a.localDate < b.localDate ? 1 : -1));
        setLogs(rows);
      } catch (e: any) {
        setError(e?.message || "Failed to load logs.");
      }
    })();
  }, [user, id]);

  const todayKey = useMemo(() => formatYMD(new Date()), []);
  const todayDone = useMemo(
    () => logs.some((l) => l.localDate === todayKey && l.done),
    [logs, todayKey]
  );

  const currentStreak = useMemo(() => {
    const byDate = new Map(logs.map((l) => [l.localDate, !!l.done]));
    let streak = 0;
    for (let i = 0; i < 90; i++) {
      const key = formatYMD(daysBack(new Date(), i));
      if (byDate.get(key)) streak++;
      else break;
    }
    return streak;
  }, [logs]);

  const weeklyCount = useMemo(() => {
    const sevenDays = new Set(
      Array.from({ length: 7 }).map((_, i) => formatYMD(daysBack(new Date(), i)))
    );
    return logs.filter((l) => sevenDays.has(l.localDate) && l.done).length;
  }, [logs]);

  const markTodayDone = async () => {
    if (!user || !id || savingToday || todayDone) return;
    setSavingToday(true);
    setError(null);
    try {
      const ref = doc(db, "user_habits", id, "logs", todayKey);
      await setDoc(ref, { localDate: todayKey, done: true, ts: Date.now() }, { merge: true });
      setLogs((prev) => {
        const exists = prev.some((l) => l.localDate === todayKey);
        if (exists) return prev.map((l) => (l.localDate === todayKey ? { ...l, done: true } : l));
        return [{ localDate: todayKey, done: true }, ...prev];
      });
    } catch (e: any) {
      setError(e?.message || "Could not save today’s log.");
    } finally {
      setSavingToday(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <button
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

              <Button
                onClick={markTodayDone}
                disabled={todayDone || savingToday}
                className={`${
                  todayDone
                    ? "bg-emerald-600/30 text-emerald-200"
                    : "bg-teal-500 hover:bg-teal-400 text-black"
                }`}
              >
                {todayDone ? "Done for today ✓" : savingToday ? "Saving…" : "Mark today done"}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <Card className="bg-slate-900/70 border-slate-800 p-4 text-center">
                <div className="text-xs text-slate-400">Current streak</div>
                <div className="mt-1 text-2xl font-bold">{currentStreak}🔥</div>
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

            <Card className="bg-slate-900/70 border-slate-800 p-5 mt-5">
              <h3 className="font-semibold">Recent days</h3>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, i) => {
                  const key = formatYMD(daysBack(new Date(), i));
                  const done = logs.some((l) => l.localDate === key && l.done);
                  return (
                    <div
                      key={key}
                      title={key}
                      className={`aspect-square rounded-lg border ${
                        done
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-slate-800/60 border-slate-700"
                      } grid place-items-center text-xs text-slate-300`}
                    >
                      {done ? "✓" : ""}
                    </div>
                  );
                })}
              </div>
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
