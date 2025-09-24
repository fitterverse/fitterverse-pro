import React from 'react'

export default function Stepper({ step, total }: { step: number, total: number }){
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i+1).map(n => (
        <div key={n} className={`h-2 flex-1 rounded-full ${n <= step ? 'bg-brand' : 'bg-slate-800'}`} />
      ))}
    </div>
  )
}
