import React from "react";
import { sfx } from "@/lib/sfx";

type Props = {
  done: number;      // sessions completed this week
  target: number;    // target per week
  label?: string;    // e.g. "Workouts"
  onTick?: () => void;
};

export default function WeeklyQuotaRing({ done, target, label = "Sessions", onTick }: Props) {
  const pct = Math.max(0, Math.min(1, target ? done / target : 0));
  const angle = 2 * Math.PI * pct;
  const r = 34, cx = 40, cy = 40;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const largeArc = pct > 0.5 ? 1 : 0;

  const handlePlus = () => {
    sfx.tap();
    onTick?.();
  };

  return (
    <div className="rounded-2xl border p-4 bg-slate-900/60 border-slate-800">
      <div className="flex items-center justify-between">
        <div className="text-slate-300 text-xs">{label} this week</div>
        <button
          onClick={handlePlus}
          className="relative rounded-lg px-3 py-1.5 text-sm bg-teal-500 text-black hover:bg-teal-400 active:scale-[.98]"
        >
          + Log
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle cx="40" cy="40" r="34" stroke="#1f2937" strokeWidth="8" fill="none" />
          {pct > 0 && (
            <path
              d={`M 40 6 A 34 34 0 ${largeArc} 1 ${x} ${y}`}
              stroke="rgb(20 184 166)" strokeWidth="8" fill="none" strokeLinecap="round"
            />
          )}
        </svg>
        <div>
          <div className="text-2xl font-extrabold text-white">
            {done}/{target}
          </div>
          <div className="text-xs text-slate-400">{Math.round(pct * 100)}% complete</div>
        </div>
      </div>
    </div>
  );
}
