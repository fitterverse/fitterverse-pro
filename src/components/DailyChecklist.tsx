import React from 'react'
import { useApp } from './state/appStore'
import { todayKey, humanDate } from './lib/time'

export default function DailyChecklist(){
  const key = todayKey()
  const { ensureToday, plan, toggleTask, streak } = useApp()
  React.useEffect(() => { ensureToday() }, [ensureToday])

  const day = plan[key]
  if (!day) return null

  const doneCount = Object.values(day.completed).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-slate-400">Today</div>
        <div className="text-xl font-semibold">{humanDate(new Date())}</div>
        <div className="text-sm text-slate-400">Streak: <span className="text-brand">{streak}</span> day{streak===1?'':'s'}</div>
      </div>
      <div className="space-y-3">
        {day.tasks.map(t => (
          <label key={t.id} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-brand"
              checked={!!day.completed[t.id]}
              onChange={() => toggleTask(key, t.id)}
            />
            <div className="flex-1">
              <div className="font-medium">{t.text}</div>
              {t.tip && <div className="text-xs text-slate-400 mt-1">{t.tip}</div>}
            </div>
            {t.minutes && <div className="badge">{t.minutes}m</div>}
          </label>
        ))}
      </div>
      <div className="text-sm text-slate-400">Progress: {doneCount}/{day.tasks.length}</div>
    </div>
  )
}
