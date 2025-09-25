// src/components/DailyChecklist.tsx
import React from "react";
import { useApp } from "../state/appStore";
import { todayKey, humanDate } from "../lib/time";

export default function DailyChecklist() {
  const { ensureTodayPlan, toggleTask } = useApp();
  const day = ensureTodayPlan();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-sm text-slate-400 mb-2">{humanDate(new Date(day.date))}</div>
      <ul className="space-y-3 text-slate-200">
        {day.tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3">
            <button
              aria-label="toggle"
              onClick={() => toggleTask(day.date, t.id)}
              className="h-5 w-5 rounded border border-slate-600"
            />
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
