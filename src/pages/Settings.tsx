import React from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useApp } from '../state/appStore'
import Input from '../components/ui/Input'

export default function Settings(){
  const { profile, setProfile } = useApp()
  const [name, setName] = React.useState(profile.name || '')
  const [goal, setGoal] = React.useState(profile.goal || '')

  function save(){
    setProfile({ name, goal })
    alert('Saved!')
  }

  return (
    <div className="container py-8 space-y-6 max-w-xl">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <Input label="First name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Main goal" value={goal} onChange={e => setGoal(e.target.value)} />
          <div className="flex justify-end"><Button onClick={save}>Save</Button></div>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold mb-2">Export / Import</h2>
        <div className="text-sm text-slate-400">Future: sync or export your data.</div>
      </Card>
    </div>
  )
}
