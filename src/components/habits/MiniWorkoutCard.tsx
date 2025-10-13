// src/components/habits/MiniWorkoutCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";

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
  const cache = useRef<{ [s: string]: HTMLAudioElement | null }>({});
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

export default function MiniWorkoutCard({
  habitId,
  name,
  targetDays,
  onOpen,
}: {
  habitId: string;
  name: string;
  targetDays: number;
  onOpen: () => void;
}) {
  const { play } = useSFX();
  const todayKey = ymd(new Date());
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      const logsCol = collection(db, "user_habits", habitId, "logs");
      const qs = await getDocs(query(logsCol));
      const map = new Map<string, any>();
      qs.docs.forEach((d) => map.set((d.data() as any).localDate, d.data()));
      // count this week's done
      const start = startOfWeek();
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return ymd(d);
      });
      setCount(days.filter((k) => Boolean(map.get(k)?.workoutDone)).length);
    })();
  }, [habitId, todayKey]);

  const pct = useMemo(() => Math.min(100, Math.round((count / Math.max(1, targetDays)) * 100)), [count, targetDays]);

  const toggleToday = async () => {
    const ref = doc(db, "user_habits", habitId, "logs", todayKey);
    const snap = await getDoc(ref);
    const willBe = !(snap.exists() && Boolean(snap.data().workoutDone));
    const payload = { localDate: todayKey, ts: Date.now(), workoutDone: willBe, done: willBe };
    if (snap.exists()) await updateDoc(ref, payload); else await setDoc(ref, payload);
    setCount((c) => c + (willBe ? 1 : -1 >= 0 ? -1 : 0));
    play(willBe ? "success" : "partial");
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onOpen}>Open</button>
      </div>
      <div className="mt-1 text-slate-300 text-sm">This week: {count} / {targetDays}</div>
      <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button onClick={toggleToday} className="bg-teal-500 hover:bg-teal-400 text-black">
          {/** simple toggle */}
          Done today
        </Button>
        <Button variant="ghost" onClick={onOpen}>Add details</Button>
      </div>
    </Card>
  );
}
