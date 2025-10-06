import React from "react";

type Phase = { id: number; name: string; days: number };
type Props = {
  current: number;            // 1..n current phase index
  dayInPhase: number;         // 1..days
  phases?: Phase[];           // override
};

const DEFAULT: Phase[] = [
  { id: 1, name: "Foundation", days: 14 },
  { id: 2, name: "Entrenchment", days: 45 },
  { id: 3, name: "Identity", days: 66 },
];

export default function PhaseTimeline({ current, dayInPhase, phases = DEFAULT }: Props) {
  return (
    <div className="rounded-2xl border p-4 bg-slate-900/60 border-slate-800">
      <div className="text-slate-300 text-xs">Phase</div>
      <div className="mt-1 text-white font-semibold">
        {phases.find(p => p.id === current)?.name || `Act ${current}`}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {phases.map((p) => {
          const active = p.id === current;
          return (
            <div key={p.id} className="flex-1">
              <div className={`h-2 rounded-full ${active ? "bg-teal-400" : "bg-slate-700"}`} />
              <div className="mt-1 text-[10px] text-slate-400">{p.name}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        Day {dayInPhase} of {phases.find(p => p.id === current)?.days ?? "?"}
      </div>
    </div>
  );
}
