// src/components/DietHabitCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";

type Meal = "breakfast" | "lunch" | "dinner";
type MealState = "yes" | "partial" | "no" | "skip";
type LogDoc = {
  localDate: string;
  meals?: Partial<Record<Meal, MealState>>;
  ts?: number;
  done?: boolean;
};

const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

function toScore(v?: MealState) {
  if (v === "yes") return 1;
  if (v === "partial") return 0.5;
  if (v === "no") return 0;
  return -1;
}
const barColor = (pct: number) =>
  pct >= 85 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-slate-600";
const heatColor = (v: number) =>
  v < 0 ? "bg-slate-800" : v >= 1 ? "bg-emerald-500/70" : v >= 0.5 ? "bg-amber-500/70" : "bg-slate-700";

/* Sounds: tries /sfx/<name>.mp3 then .wav; silently ignores if missing */
function useSFX() {
  const cache = useRef<{ [src: string]: HTMLAudioElement | null }>({});
  const getAudio = (base: string) => {
    for (const src of [`${base}.mp3`, `${base}.wav`]) {
      if (!cache.current[src]) {
        try {
          const a = new Audio(src);
          a.volume = 0.5;
          cache.current[src] = a;
          return a;
        } catch {
          cache.current[src] = null;
        }
      } else if (cache.current[src]) return cache.current[src]!;
    }
    return null;
  };
  return {
    play(name: "success" | "partial" | "streak") {
      const a = getAudio(`/sfx/${name}`);
      if (!a) return;
      try {
        a.currentTime = 0;
        a.play().catch(() => {});
      } catch {}
    },
  };
}

export default function DietHabitCard({
  habitId,
  onOpenTracker,
}: {
  habitId: string;
  onOpenTracker?: () => void;
}) {
  const today = ymd(new Date());
  const [todayMeals, setTodayMeals] = useState<Record<Meal, MealState | undefined>>({
    breakfast: undefined,
    lunch: undefined,
    dinner: undefined,
  });
  const [recent, setRecent] = useState<LogDoc[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [tipOpen, setTipOpen] = useState(false); // collapsed by default on mobile
  const { play } = useSFX();

  useEffect(() => {
    (async () => {
      const ref = doc(db, "user_habits", habitId, "logs", today);
      const snap = await getDoc(ref);
      const m = snap.exists() ? (snap.data().meals ?? {}) : {};
      setTodayMeals({
        breakfast: m.breakfast as MealState | undefined,
        lunch: m.lunch as MealState | undefined,
        dinner: m.dinner as MealState | undefined,
      });

      const logsCol = collection(db, "user_habits", habitId, "logs");
      const qs = await getDocs(query(logsCol));
      const all = qs.docs.map((d) => d.data() as LogDoc);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      setRecent(
        all
          .filter((x) => new Date(x.localDate + "T00:00:00") >= cutoff)
          .sort((a, b) => (a.localDate < b.localDate ? -1 : 1))
      );
    })();
  }, [habitId, today]);

  const setMeal = async (meal: Meal, state: MealState) => {
    const ref = doc(db, "user_habits", habitId, "logs", today);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        localDate: today,
        ts: Date.now(),
        meals: { ...(snap.data().meals ?? {}), [meal]: state },
      });
    } else {
      await setDoc(ref, {
        localDate: today,
        done: true,
        ts: Date.now(),
        meals: { [meal]: state },
      });
    }
    setTodayMeals((s) => ({ ...s, [meal]: state }));

    if (state === "yes") {
      setConfettiKey((k) => k + 1);
      play("success");
      if (window?.navigator?.vibrate) window.navigator.vibrate(20);
    } else if (state === "partial") play("partial");
  };

  const todayScore = useMemo(() => {
    const sum = MEALS.map((m) => toScore(todayMeals[m]))
      .filter((v) => v >= 0)
      .reduce((a, b) => a + b, 0);
    return sum / MEALS.length || 0;
  }, [todayMeals]);
  const todayPct = Math.round(todayScore * 100);

  const streak = useMemo(() => {
    const byDate = new Map<string, LogDoc>();
    recent.forEach((r) => byDate.set(r.localDate, r));
    byDate.set(today, { localDate: today, meals: todayMeals });
    let c = 0;
    for (let i = 0; i < 90; i++) {
      const t = new Date();
      t.setDate(t.getDate() - i);
      const key = ymd(t);
      const log = byDate.get(key);
      const sum = MEALS.map((m) => toScore(log?.meals?.[m]))
        .filter((v) => v >= 0)
        .reduce((a, b) => a + b, 0);
      if (sum >= 1.5) c++;
      else break;
    }
    return c;
  }, [recent, today, todayMeals]);

  const miniDays = useMemo(() => {
    const arr: string[] = [];
    const d = new Date();
    for (let i = 6; i >= 0; i--) {
      const t = new Date(d);
      t.setDate(d.getDate() - i);
      arr.push(ymd(t));
    }
    return arr;
  }, []);
  const byDate = useMemo(() => {
    const map = new Map<string, LogDoc>();
    recent.forEach((x) => map.set(x.localDate, x));
    map.set(today, { localDate: today, meals: todayMeals });
    return map;
  }, [recent, today, todayMeals]);

  const tip = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 13);
    const scores: Record<Meal, number> = { breakfast: 0, lunch: 0, dinner: 0 };
    const counts: Record<Meal, number> = { breakfast: 0, lunch: 0, dinner: 0 };
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = ymd(d);
      const log = byDate.get(key);
      MEALS.forEach((m) => {
        const s = toScore(log?.meals?.[m]);
        if (s >= 0) {
          scores[m] += s;
          counts[m] += 1;
        }
      });
    }
    let worst: Meal = "breakfast";
    let min = 999;
    MEALS.forEach((m) => {
      const avg = counts[m] ? scores[m] / counts[m] : 0;
      if (avg < min) {
        min = avg;
        worst = m;
      }
    });
    const library: Record<Meal, { cue: string; action: string; reward: string }> = {
      breakfast: {
        cue: "Put oats & chia next to the kettle tonight.",
        action: "2-min prep after brushing your teeth.",
        reward: "Tick Breakfast ✔ and read your win card.",
      },
      lunch: {
        cue: "Block 25 min for lunch on your calendar.",
        action: "Pick protein first, sides second.",
        reward: "Lock Lunch ✔ and boost your streak.",
      },
      dinner: {
        cue: "Set an 8pm reminder: ‘No second serving’.",
        action: "Half-plate veg rule before carbs.",
        reward: "Mark Dinner ✔ and unlock tomorrow’s tip.",
      },
    };
    return { focus: worst, ...library[worst] };
  }, [byDate]);

  const R = 42;
  const C = 2 * Math.PI * R;
  const dashOffset = (1 - todayScore) * C;

  return (
    <Card className="bg-slate-900/70 border-slate-800 p-4 md:p-5 overflow-hidden relative">
      {/* Confetti */}
      <div key={confettiKey} className="pointer-events-none absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute h-1.5 w-1.5 bg-teal-400"
            style={{
              left: "50%",
              top: "18%",
              transform: `translate(-50%,-50%) rotate(${i * 30}deg)`,
              animation: "confetti-fly 600ms ease-out",
              animationDelay: `${i * 15}ms`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="flex items-start gap-4">
        {/* Progress ring */}
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r={R} stroke="rgb(30 41 59)" strokeWidth="12" fill="none" />
            <circle
              cx="50" cy="50" r={R}
              stroke="rgb(20 184 166)" strokeWidth="12" strokeLinecap="round" fill="none"
              strokeDasharray={C} strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 300ms ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-xl font-bold">{todayPct}%</div>
              <div className="text-[10px] text-slate-400 -mt-1">today</div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Eat healthy</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Streak {streak}d
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Tap your meals below—aim for “Yes” or “Partial”.
          </p>

          {/* Meals: 1-col on mobile; 3-col ≥sm */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {MEALS.map((m) => {
              const val = todayMeals[m];
              const btn = (state: MealState, label: string, on: boolean, color: string) => (
                <button
                  className={`flex-1 text-sm px-3 py-2 rounded-lg border transition
                    ${on ? `${color} border-current`
                         : "bg-slate-900/60 border-slate-700 hover:border-slate-500"}`}
                  onClick={() => setMeal(m, state)}
                >
                  {label}
                </button>
              );
              return (
                <div key={m} className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                  <div className="text-xs text-slate-400 capitalize">{m}</div>
                  <div className="mt-1 flex gap-1">
                    {btn("yes", "Yes", val === "yes", "bg-emerald-500/20 text-emerald-300")}
                    {btn("partial", "Partial", val === "partial", "bg-amber-500/20 text-amber-300")}
                    {btn("no", "No", val === "no", "bg-rose-500/20 text-rose-300")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Focus tip: collapsible on mobile */}
          <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <button
              className="w-full text-left px-3 py-2 text-sm flex items-center justify-between sm:cursor-default"
              onClick={() => setTipOpen((s) => !s)}
            >
              <div>
                <span className="text-slate-400">Focus next: </span>
                <span className="font-semibold capitalize">{tip.focus}</span>
              </div>
              <span className="sm:hidden text-slate-400 text-xs">{tipOpen ? "Hide" : "Show"}</span>
            </button>
            <div className={`px-3 pb-3 ${tipOpen ? "" : "hidden sm:block"}`}>
              <ul className="text-xs text-slate-300 space-y-1">
                <li><b>Cue:</b> {tip.cue}</li>
                <li><b>Action:</b> {tip.action}</li>
                <li><b>Reward:</b> {tip.reward}</li>
              </ul>
            </div>
          </div>

          {/* Heatmaps: stack vertically on mobile */}
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MEALS.map((m) => (
              <div key={m}>
                <div className="text-xs text-slate-400 capitalize mb-1">{m}</div>
                <div className="grid grid-cols-7 gap-[3px]">
                  {miniDays.map((d, idx) => {
                    const v = toScore(byDate.get(d)?.meals?.[m]);
                    return (
                      <div
                        key={idx}
                        className={`h-3.5 rounded ${heatColor(v)} animate-[tile_120ms_ease-out]`}
                        title={`${m} · ${d}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${barColor(todayPct)} transition-all`} style={{ width: `${todayPct}%` }} />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Daily progress</div>
            </div>
            <Button onClick={onOpenTracker} className="bg-teal-500 hover:bg-teal-400 text-black">
              Open tracker
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti-fly {
          0% { transform: translate(-50%,-50%) scale(1) rotate(0deg); opacity: 0.95; }
          70% { opacity: 0.95; }
          100% {
            transform: translate(calc(-50% + ${Math.random() * 160 - 80}px),
                                 calc(-50% + ${Math.random() * 100 + 40}px))
                       rotate(${Math.random() * 180 - 90}deg);
            opacity: 0;
          }
        }
        @keyframes tile {
          from { transform: rotateY(90deg); opacity: 0.6; }
          to { transform: rotateY(0deg); opacity: 1; }
        }
      `}</style>
    </Card>
  );
}
