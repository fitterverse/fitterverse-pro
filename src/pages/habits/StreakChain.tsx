import React from "react";
import classNames from "classnames";
import { sfx } from "@/lib/sfx";

type Props = {
  count: number;          // current streak (days)
  best?: number;          // best all-time
  onCelebrate?: () => void;
};

export default function StreakChain({ count, best, onCelebrate }: Props) {
  const [flash, setFlash] = React.useState(false);
  const [burst, setBurst] = React.useState(false);

  const handleCelebrate = () => {
    setFlash(true);
    setBurst(true);
    sfx.success();
    onCelebrate?.();
    setTimeout(() => setFlash(false), 450);
    setTimeout(() => setBurst(false), 950);
  };

  const dots = Array.from({ length: Math.min(count, 7) });

  return (
    <div className={classNames("relative rounded-2xl border p-4 bg-slate-900/60 border-slate-800", flash && "anim-pop")}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-slate-300 text-xs">Current streak</div>
          <div className="text-2xl font-extrabold text-white">{count} day{count === 1 ? "" : "s"}</div>
          {typeof best === "number" && (
            <div className="text-xs text-slate-400 mt-1">Best: {best} days</div>
          )}
        </div>
        <button
          onClick={handleCelebrate}
          className="relative rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-500/30 px-4 py-2 text-sm active:scale-[.98]"
          aria-label="Celebrate streak"
        >
          🎉 Celebrate
        </button>
      </div>

      <div className="mt-4 flex gap-1.5">
        {dots.map((_, i) => (
          <div key={i} className="h-2 flex-1 rounded-full bg-emerald-400/70" />
        ))}
        {Array.from({ length: Math.max(0, 7 - dots.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="h-2 flex-1 rounded-full bg-slate-700" />
        ))}
      </div>

      {/* confetti burst */}
      {burst && (
        <div className="pointer-events-none absolute right-6 top-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="confetti-dot"
              style={{
                left: `${(i - 3) * 6}px`,
                background:
                  ["#34d399", "#22d3ee", "#a78bfa", "#f472b6", "#facc15"][i % 5],
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
