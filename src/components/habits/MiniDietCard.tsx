// src/components/habits/MiniDietCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type Meal = "breakfast" | "lunch" | "dinner";
type MealState = "yes" | "partial" | "no";
type LogDoc = {
  localDate: string;
  meals?: Partial<Record<Meal, MealState>>;
  ts?: number;
  done?: boolean;
};

const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];
const ymd = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

function useSFX() {
  const cache = useRef<{ [src: string]: HTMLAudioElement | null }>({});
  const getAudio = (base: string) => {
    for (const src of [`${base}.mp3`, `${base}.wav`]) {
      if (!cache.current[src]) {
        try { const a = new Audio(src); a.volume = 0.5; cache.current[src] = a; return a; } catch { cache.current[src] = null; }
      } else if (cache.current[src]) return cache.current[src]!;
    }
    return null;
  };
  return {
    play(name: "success" | "partial") {
      const a = getAudio(`/sfx/${name}`);
      if (!a) return;
      try { a.currentTime = 0; a.play().catch(()=>{}); } catch {}
    },
  };
}

export default function MiniDietCard({
  habitId,
  name,
  onOpen,
}: {
  habitId: string;
  name: string;
  onOpen: () => void;
}) {
  const today = ymd(new Date());
  const { play } = useSFX();

  const [meals, setMeals] = useState<Record<Meal, MealState | undefined>>({
    breakfast: undefined,
    lunch: undefined,
    dinner: undefined,
  });

  // load today
  useEffect(() => {
    (async () => {
      const ref = doc(db, "user_habits", habitId, "logs", today);
      const snap = await getDoc(ref);
      const m = snap.exists() ? (snap.data().meals ?? {}) : {};
      setMeals({
        breakfast: m.breakfast as MealState | undefined,
        lunch: m.lunch as MealState | undefined,
        dinner: m.dinner as MealState | undefined,
      });
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
        done: true,
      });
    } else {
      await setDoc(ref, {
        localDate: today,
        ts: Date.now(),
        done: true,
        meals: { [meal]: state },
      } as LogDoc);
    }
    setMeals((s) => ({ ...s, [meal]: state }));
    play(state === "yes" ? "success" : "partial");
    if (state === "yes" && window?.navigator?.vibrate) window.navigator.vibrate(20);
  };

  const yesCount = useMemo(
    () => MEALS.filter((m) => meals[m] === "yes").length,
    [meals]
  );
  const pct = useMemo(() => Math.round((yesCount / MEALS.length) * 100), [yesCount]);

  return (
    <Card className="bg-slate-900/60 border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onOpen}>
          Open
        </button>
      </div>

      {/* tiny progress bar */}
      <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* meal row — compact & phone-friendly */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {MEALS.map((m) => {
          const v = meals[m];
          const pill = (label: string, active: boolean, color: string, onClick: () => void) => (
            <button
              onClick={onClick}
              className={`px-2 py-1 rounded-lg border text-xs ${
                active ? `${color} border-current text-black/90` : "bg-slate-900/60 border-slate-700"
              }`}
            >
              {label}
            </button>
          );
          return (
            <div key={m} className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
              <div className="text-[11px] text-slate-400 capitalize">{m}</div>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {pill("Yes", v === "yes", "bg-emerald-400", () => setMeal(m, "yes"))}
                {pill("Part", v === "partial", "bg-amber-400", () => setMeal(m, "partial"))}
                {pill("No", v === "no", "bg-rose-400", () => setMeal(m, "no"))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
