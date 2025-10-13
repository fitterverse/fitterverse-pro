// src/components/WorkoutHabitCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

function startOfWeek(d = new Date()) {
  const n = new Date(d);
  const day = n.getDay();
  const diff = (day + 6) % 7;
  n.setDate(n.getDate() - diff);
  n.setHours(0,0,0,0);
  return n;
}
function useSFX() {
  const cache = useRef<{ [src: string]: HTMLAudioElement | null }>({});
  const get = (base: string) => {
    for (const src of [`${base}.mp3`, `${base}.wav`]) {
      if (!cache.current[src]) {
        try { const a = new Audio(src); a.volume = 0.5; cache.current[src] = a; return a; } catch { cache.current[src] = null; }
      } else if (cache.current[src]) return cache.current[src]!;
    }
    return null;
  };
  return { play(name: "success" | "partial") { const a = get(`/sfx/${name}`); if (!a) return; try { a.currentTime = 0; a.play().catch(()=>{});} catch {} } };
}

const TYPES = ["Gym/Strength","Cardio","Yoga/Pilates","Sports","Bodyweight","Other"] as const;
type WType = typeof TYPES[number];

const BODY_PARTS = ["Full body","Upper","Lower","Push","Pull","Legs","Chest","Back","Shoulders","Arms","Core"] as const;

export default function WorkoutHabitCard({
  habitId,
  targetDays,
}: {
  habitId: string;
  targetDays: number; // 1..7
}) {
  const todayKey = ymd(new Date());
  const { play } = useSFX();

  const [week, setWeek] = useState<{ key: string; done: boolean }[]>(
    Array.from({ length: 7 }).map((_, i) => {
      const d = startOfWeek();
      d.setDate(d.getDate() + i);
      return { key: ymd(d), done: false };
    })
  );

  // Detail for today
  const [wType, setWType] = useState<WType | null>(null);
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [duration, setDuration] = useState<30 | 60 | 90 | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      const logsCol = collection(db, "user_habits", habitId, "logs");
      const qs = await getDocs(query(logsCol));
      const map = new Map<string, any>();
      qs.docs.forEach((d) => map.set((d.data() as any).localDate, d.data()));
      setWeek((w) =>
        w.map((day) => ({
          ...day,
          done: Boolean(map.get(day.key)?.workoutDone),
        }))
      );
      const today = map.get(todayKey);
      if (today) {
        setWType((today.workoutType as WType) || null);
        setBodyPart(today.bodyPart || null);
        setDuration((today.durationMin as 30|60|90) || null);
        setNotes(today.notes || "");
      }
    })();
  }, [habitId, todayKey]);

  const count = week.filter((d) => d.done).length;
  const pct = Math.round((count / Math.max(1, targetDays)) * 100);

  const saveToday = async (markDone: boolean) => {
    const ref = doc(db, "user_habits", habitId, "logs", todayKey);
    const snap = await getDoc(ref);
    const payload: any = {
      localDate: todayKey,
      ts: Date.now(),
      workoutDone: markDone,
      done: markDone,
      ...(wType ? { workoutType: wType } : {}),
      ...(bodyPart ? { bodyPart } : {}),
      ...(duration ? { durationMin: duration } : {}),
      ...(notes ? { notes } : {}),
    };
    if (snap.exists()) await updateDoc(ref, payload);
    else await setDoc(ref, payload);
    setWeek((w) => w.map((d) => (d.key === todayKey ? { ...d, done: markDone } : d)));
    play(markDone ? "success" : "partial");
    if (markDone && window?.navigator?.vibrate) window.navigator.vibrate(20);
  };

  const dayLabel = (k: string) => {
    const d = new Date(k + "T00:00:00");
    return ["M","T","W","T","F","S","S"][(d.getDay() + 6) % 7];
  };

  return (
    <Card className="bg-slate-900/70 border-slate-800 p-4 md:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workout</h3>
          <p className="text-slate-400 text-sm">Weekly target: {targetDays}×</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">This week</div>
          <div className="font-semibold">{count} / {targetDays}</div>
        </div>
      </div>

      {/* Weekly grid */}
      <div className="mt-3 grid grid-cols-7 gap-2">
        {week.map((d) => (
          <div
            key={d.key}
            className={`h-9 rounded-xl grid place-items-center text-sm border
              ${d.done ? "bg-emerald-500/20 text-emerald-300 border-emerald-400"
                       : "bg-slate-950/60 text-slate-300 border-slate-800"}`}
            title={d.key}
          >
            {dayLabel(d.key)}
          </div>
        ))}
      </div>

      {/* Today details */}
      <div className="mt-5 grid gap-4">
        <div>
          <div className="text-sm text-slate-300 mb-2">Type</div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setWType(t);
                  if (t !== "Gym/Strength") setBodyPart(null); // bodyPart only for strength
                }}
                className={`px-3 py-2 rounded-xl border text-sm
                  ${wType === t ? "bg-teal-500/20 border-teal-400"
                                : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {wType === "Gym/Strength" && (
          <div>
            <div className="text-sm text-slate-300 mb-2">Body part</div>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map((bp) => (
                <button
                  key={bp}
                  onClick={() => setBodyPart(bp)}
                  className={`px-3 py-2 rounded-xl border text-sm
                    ${bodyPart === bp ? "bg-indigo-500/20 border-indigo-400"
                                      : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
                >
                  {bp}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-slate-300 mb-2">Duration</div>
          <div className="flex flex-wrap gap-2">
            {[30, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m as 30|60|90)}
                className={`px-3 py-2 rounded-xl border text-sm
                  ${duration === m ? "bg-amber-500/20 border-amber-400"
                                   : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-300">Notes (optional)</label>
          <textarea
            className="mt-1 w-full rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2 text-sm"
            rows={3}
            placeholder="What did you do? PRs? How it felt?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Weekly progress</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => saveToday(false)}>Undo today</Button>
          <Button onClick={() => saveToday(true)} className="bg-teal-500 hover:bg-teal-400 text-black">
            Save today
          </Button>
        </div>
      </div>
    </Card>
  );
}
