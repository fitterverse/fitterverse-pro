import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Navbar(){
  return (
    <nav className="border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-slate-900 font-bold">FV</span>
          <span className="font-semibold">Fitterverse</span>
        </div>
        <div className="flex items-center gap-6 text-slate-300">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/onboarding">Onboarding</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </div>
      </div>
    </nav>
  )
}
