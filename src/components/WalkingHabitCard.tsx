// src/components/WalkingHabitCard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { db } from "@/lib/firebase";

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

export default function WalkingHabitCard({
  habitId,
  target,
}: {
  habitId: string;
  target: number; // steps
}) {
  const today = ymd(new Date());
  const { play } = useSFX();

  const [todaySteps, setTodaySteps] = useState<number | "">(0);
  const [logs, setLogs] = useState<{ localDate: string; steps?: number }[]>([]);
  const [range, setRange] = useState<"7" | "30" | "90">("7");
  const [source, setSource] = useState<string | null>(null); // GoogleFit / AppleHealth / Fitbit (stub)

  useEffect(() => {
    (async () => {
      const logsCol = collection(db, "user_habits", habitId, "logs");
      const qs = await getDocs(query(logsCol));
      const all = qs.docs.map((d) => d.data() as any).sort((a, b) => (a.localDate < b.localDate ? -1 : 1));
      setLogs(all);
      const ref = doc(db, "user_habits", habitId);
      const snap = await getDoc(ref);
      if (snap.exists()) setSource(snap.data()?.stepsSource || null);

      const tsRef = doc(db, "user_habits", habitId, "logs", today);
      const tsSnap = await getDoc(tsRef);
      if (tsSnap.exists()) setTodaySteps(Number(tsSnap.data()?.steps || 0));
    })();
  }, [habitId, today]);

  const save = async (val: number) => {
    const ref = doc(db, "user_habits", habitId, "logs", today);
    const snap = await getDoc(ref);
    const payload = { localDate: today, ts: Date.now(), steps: val, done: val >= target * 0.5 };
    if (snap.exists()) await updateDoc(ref, payload); else await setDoc(ref, payload);
    setTodaySteps(val);
    play(val >= target ? "success" : val > 0 ? "partial" : "partial");
  };

  // Range filter & stats
  const period = useMemo(() => {
    const days = Number(range);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return logs.filter((l) => new Date(l.localDate + "T00:00:00") >= start);
  }, [logs, range]);
  const avg = useMemo(() => {
    if (!period.length) return 0;
    const s = period.reduce((a, b) => a + Number(b.steps || 0), 0);
    return Math.round(s / period.length);
  }, [period]);

  const pctToday = useMemo(() => Math.min(100, Math.round((Number(todaySteps || 0) / Math.max(1, target)) * 100)), [todaySteps, target]);

  const connect = async (kind: "GoogleFit" | "AppleHealth" | "Fitbit") => {
    // Stub: persist a preference; real OAuth can be added later (web: Google Fit REST; iOS/Android: native HealthKit/Health Connect)
    const ref = doc(db, "user_habits", habitId);
    await updateDoc(ref, { stepsSource: kind });
    setSource(kind);
  };

  return (
    <Card className="bg-slate-900/70 border-slate-800 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Walking</h3>
          <p className="text-slate-400 text-sm">Target: {target.toLocaleString()} steps</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Avg ({range}d)</div>
          <div className="font-semibold">{avg.toLocaleString()} steps</div>
        </div>
      </div>

      {/* Period picker */}
      <div className="mt-3 flex gap-2">
        {(["7","30","90"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-lg border text-sm
              ${range === r ? "bg-indigo-500/20 border-indigo-400"
                            : "bg-slate-900/60 border-slate-800 hover:border-slate-600"}`}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Today input */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr,auto]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <label className="text-xs text-slate-400">Steps today</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              className="flex-1 rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              value={todaySteps}
              onChange={(e) => setTodaySteps(Number(e.target.value || 0))}
              placeholder="0"
            />
            <Button onClick={() => save(Number(todaySteps || 0))} className="bg-teal-500 hover:bg-teal-400 text-black">
              Save
            </Button>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${pctToday}%` }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{pctToday}% of target</div>
        </div>

        <div className="grid gap-2">
          <Button onClick={() => save(target)} className="bg-emerald-500/90 hover:bg-emerald-500 text-black">
            Hit target
          </Button>
          <Button onClick={() => save(Math.round(target * 0.6))} className="bg-amber-500/90 hover:bg-amber-500 text-black">
            Partial
          </Button>
          <Button onClick={() => save(0)} className="bg-slate-800 hover:bg-slate-700">
            No walk
          </Button>
        </div>
      </div>

      {/* Connect source (stub) */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Steps source</div>
            <div className="text-slate-400 text-xs">{source || "Not connected"}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => connect("GoogleFit")}>Google Fit</Button>
            <Button variant="ghost" onClick={() => connect("AppleHealth")}>Apple Health</Button>
            <Button variant="ghost" onClick={() => connect("Fitbit")}>Fitbit</Button>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Connections are optional. If connected, we’ll auto-fill steps and keep manual override.
        </p>
      </div>
    </Card>
  );
}
