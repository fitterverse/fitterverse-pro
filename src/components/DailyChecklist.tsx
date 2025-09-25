// src/components/DailyChecklist.tsx
import React from "react";
import { useApp, Task } from "../state/appStore";
import { todayKey, humanDate } from "../lib/time";

export default function DailyChecklist() {
  const { plans } = useApp();
  const key = todayKey(new Date());
  const day = plans[key];

  if (!day) return null;

  return (
    <div>
      <div className="text-sm text-slate-400 mb-2">{humanDate(new Date(day.date))}</div>
      <ul className="space-y-3">
        {day.tasks.map((t: Task) => (
          <li key={t.id} className="flex items-center gap-3">
            <span className="h-5 w-5 rounded border border-slate-600" />
            <span>{t.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
