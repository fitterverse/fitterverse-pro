// src/components/DailyChecklist.tsx
import React from "react";
import { useApp } from "@/state/appStore";
import { todayKey, humanDate } from "@/lib/time";

type DayTask = {
  id: string;
  text: string;
  done?: boolean;
};

type DayPlan = {
  date: string; // ISO or yyyy-mm-dd
  tasks: DayTask[];
};

export default function DailyChecklist() {
  // NOTE: useApp comes from your app store; we cast to any to avoid typing conflicts with legacy store shape.
  const { ensureTodayPlan, toggleTask } = (useApp() as any) || {};
  const day: DayPlan =
    (ensureTodayPlan && ensureTodayPlan()) || {
      date: todayKey(new Date()),
      tasks: [],
    };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-2 text-sm text-slate-400">
        {humanDate(new Date(day.date))}
      </div>

      <ul className="space-y-3 text-slate-200">
        {day.tasks.map((t: DayTask) => (
          <li key={t.id} className="flex items-center gap-3">
            <button
              aria-label="toggle"
              onClick={() =>
                toggleTask && toggleTask(day.date, t.id) // guard in case store not ready
              }
              className="h-5 w-5 rounded border border-slate-600"
            />
            <span>{t.text}</span>
          </li>
        ))}

        {/* Handle empty list gracefully */}
        {day.tasks.length === 0 && (
          <li className="text-sm text-slate-400">
            No tasks yet—add your first habit to see today’s checklist.
          </li>
        )}
      </ul>
    </div>
  );
}
