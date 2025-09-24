import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
}

export default function Input({ label, hint, ...rest }: Props){
  return (
    <label className="block space-y-1">
      {label && <div className="text-sm text-slate-300">{label}</div>}
      <input className="input" {...rest} />
      {hint && <div className="text-xs text-slate-400">{hint}</div>}
    </label>
  )
}
