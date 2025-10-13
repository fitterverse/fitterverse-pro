// src/components/habits/MiniWalkingCard.tsx
import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const ymd = (d: Date) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

export default function MiniWalkingCard({
  habitId,
  name,
  target = 7000,
  onOpen,
}: {
  habitId: string;
  name: string;
  target?: number;
  onOpen: () => void;
}) {
  const today = ymd(new Date());
  const [done, setDone] = useState<boolean>(false);
  const pct = done ? 100 : 0;

  // Load today's status
  useEffect(() => {
    (async () => {
      const ref = doc(db, "user_habits", habitId, "logs", today);
      const snap = await getDoc(ref);
      setDone(!!snap.data()?.done);
    })();
  }, [habitId, today]);

  const toggleToday = async () => {
    const ref = doc(db, "user_habits", habitId, "logs", today);
    const snap = await getDoc(ref);
    const next = !done;

    if (snap.exists()) {
      // 🔒 obey rules: only localDate, done, ts
      await updateDoc(ref, { localDate: today, done: next, ts: Date.now() });
    } else {
      await setDoc(ref, { localDate: today, done: next, ts: Date.now() });
    }
    setDone(next);
    if (window?.navigator?.vibrate) window.navigator.vibrate(15);
  };

  return (
    <Card className="bg-slate-900/60 border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <button className="text-xs text-slate-400 hover:text-slate-200" onClick={onOpen}>
          Open
        </button>
      </div>

      {/* tiny progress bar */}
      <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden" aria-label="Daily walking progress">
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400">
          Target: <b>{target.toLocaleString()} steps</b>
        </div>
        <button
          onClick={toggleToday}
          className={`px-3 py-1 rounded-lg border text-xs ${
            done
              ? "bg-amber-400 text-black border-amber-300 hover:bg-amber-300"
              : "bg-emerald-400 text-black border-emerald-300 hover:bg-emerald-300"
          }`}
          title={done ? "Undo today" : "Mark today hit"}
        >
          {done ? "Undo" : "Hit goal"}
        </button>
      </div>
    </Card>
  );
}
