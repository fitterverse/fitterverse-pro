import React from "react";
import { sfx } from "@/lib/sfx";

type Props = {
  title: string;            // e.g. "Morning walk 30 min"
  note?: string;            // guidance line
  done: boolean;
  onDone: () => void;       // click handler
};

export default function TodayCard({ title, note, done, onDone }: Props) {
  const [celebrate, setCelebrate] = React.useState(false);

  const handleClick = () => {
    if (done) return;
    sfx.success();
    setCelebrate(true);
    onDone();
    setTimeout(() => setCelebrate(false), 900);
  };

  return (
    <div className="relative rounded-2xl border p-4 bg-slate-900/60 border-slate-800">
      <div className="text-xs text-slate-300">Today</div>
      <div className="mt-1 text-white font-semibold">{title}</div>
      {note && <div className="text-xs text-slate-400 mt-1">{note}</div>}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleClick}
          className={`relative rounded-xl px-4 py-2 font-semibold active:scale-[.98] ${
            done ? "bg-slate-800 text-slate-400 cursor-default" : "bg-teal-500 text-black hover:bg-teal-400 anim-ring"
          }`}
        >
          {done ? "Done" : "Mark done"}
        </button>
        {!done && <span className="text-xs text-slate-400">1 tap • no reschedule</span>}
      </div>

      {/* micro confetti */}
      {celebrate && (
        <div className="absolute right-6 top-2 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="confetti-dot"
              style={{
                left: `${(i - 4) * 6}px`,
                background:
                  ["#34d399", "#22d3ee", "#a78bfa", "#f472b6", "#facc15"][i % 5],
                animationDelay: `${i * 30}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
