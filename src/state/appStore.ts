import { create } from 'zustand'
import { storage } from '../lib/storage'
import { todayKey } from '../lib/time'

export type HabitId = 'morning-routine' | 'screen-time' | 'exercise'

export type Task = {
  id: string
  text: string
  minutes?: number
  tip?: string
}

export type DayPlan = {
  date: string
  tasks: Task[]
  completed: Record<string, boolean> // taskId -> done
}

export type UserProfile = {
  name?: string
  goal?: string
  keystone?: HabitId | null
}

type AppState = {
  profile: UserProfile
  plan: Record<string, DayPlan> // dateKey -> plan
  streak: number
  activeHabit: HabitId | null

  // actions
  setProfile: (u: Partial<UserProfile>) => void
  setActiveHabit: (h: HabitId) => void
  ensureToday: () => void
  toggleTask: (dateKey: string, taskId: string) => void
  resetAll: () => void
}

const KEY = 'fv@state'

const initial: Pick<AppState, 'profile' | 'plan' | 'streak' | 'activeHabit'> = storage.get(KEY, {
  profile: { name: '', goal: '', keystone: null },
  plan: {},
  streak: 0,
  activeHabit: null
})

export const useApp = create<AppState>((set, get) => ({
  ...initial,

  setProfile: (u) => set((s) => {
    const profile = { ...s.profile, ...u }
    const next = { ...s, profile }
    storage.set(KEY, next)
    return next
  }),

  setActiveHabit: (h) => set((s) => {
    const next = { ...s, activeHabit: h, profile: { ...s.profile, keystone: h } }
    storage.set(KEY, next)
    return next
  }),

  ensureToday: () => set((s) => {
    const key = todayKey()
    if (s.plan[key]) return s
    // create a tiny starter plan when missing
    const tasks = s.activeHabit === 'morning-routine'
      ? [
          { id: 'water', text: 'Drink a glass of water', minutes: 2, tip: 'Leave a glass on your nightstand.' },
          { id: 'sun', text: '2 minutes sunlight', minutes: 2, tip: 'Open the window and breathe.' },
          { id: 'plan', text: 'Write today’s top-1', minutes: 3, tip: 'One thing that makes today a win.' },
        ]
      : s.activeHabit === 'screen-time'
      ? [
          { id: 'no-phone', text: 'No phone 30 min after wake', tip: 'Put it to charge outside the bedroom.' },
          { id: 'focus-block', text: 'One 20-min no-scroll block', minutes: 20, tip: 'Use app/site blockers.' },
          { id: 'off-30', text: '30-min off before bed', tip: 'Set a bedtime focus mode.' }
        ]
      : [
          { id: 'walk', text: '5-min brisk walk', minutes: 5, tip: 'Shoes by the door the night before.' },
          { id: 'mobility', text: '2-min mobility', minutes: 2, tip: 'Hips + shoulders.' },
          { id: 'log', text: 'Log how you feel', minutes: 1 }
        ]

    const plan = { ...s.plan, [key]: { date: key, tasks, completed: {} } }
    const next = { ...s, plan }
    storage.set(KEY, next)
    return next
  }),

  toggleTask: (dateKey, taskId) => set((s) => {
    const day = s.plan[dateKey]
    if (!day) return s
    const completed = { ...day.completed, [taskId]: !day.completed[taskId] }
    const allDoneBefore = Object.values(day.completed).length && Object.values(day.completed).every(Boolean)
    const allDoneAfter = Object.values(completed).every(Boolean)
    let streak = s.streak
    if (!allDoneBefore && allDoneAfter) streak += 1
    const plan = { ...s.plan, [dateKey]: { ...day, completed } }
    const next = { ...s, plan, streak }
    storage.set(KEY, next)
    return next
  }),

  resetAll: () => {
    const next = {
      profile: { name: '', goal: '', keystone: null },
      plan: {},
      streak: 0,
      activeHabit: null
    }
    storage.set(KEY, next)
    set(next)
  }
}))
