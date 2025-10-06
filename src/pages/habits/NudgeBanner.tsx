import React from "react";

type Props = {
  tone?: "gentle" | "coach" | "celebrate";
  message: string;
  actionText?: string;
  onAction?: () => void;
};

export default function NudgeBanner({ tone = "gentle", message, actionText, onAction }: Props) {
  const toneStyles =
    tone === "celebrate"
      ? "border-emerald-500/30 bg-emerald-400/10 text-emerald-200"
      : tone === "coach"
      ? "border-indigo-500/30 bg-indigo-400/10 text-indigo-200"
      : "border-slate-700 bg-slate-800/60 text-slate-200";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${toneStyles}`}>
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        {actionText && (
          <button
            onClick={onAction}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
