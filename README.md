# Fitterverse Pro (Starter)

A production-ready React + Vite + TypeScript + Tailwind + Zustand scaffold for a global habit platform.
Focus: keystone habits (morning routine, screen-time detox, exercise), with daily checklist, streaks,
and environmental cue suggestions.

## 1) Quickstart

```bash
# inside the folder
npm install
npm run dev
# open the Local URL (e.g. http://localhost:5174)
```

If the page ever looks stuck, do a hard reload (Cmd+Shift+R). Service worker is **disabled in dev**.

## 2) Production preview

```bash
npm run build
npm run preview
# open the printed URL (e.g. http://localhost:4173)
```

## 3) Project structure

```
src/
  pages/            # Home, Onboarding, Dashboard, Settings
  components/       # Navbar, Stepper, DailyChecklist
    ui/             # Button, Card, Input
  state/            # Zustand store (profile, plan, streak)
  data/habits/      # JSON templates (morning, screen-time, exercise)
  lib/              # storage, time, analytics, notifications
  styles/           # Tailwind globals
```

## 4) What’s implemented

- Onboarding (name → goal → pick keystone habit)
- Tiny “starter plan” auto-generated for the chosen habit
- Daily checklist with 2–3 micro-habits and tips
- Streak increments when all tasks for a day are completed
- Local persistence (localStorage)
- Clean Tailwind UI; PWA setup (service worker only in prod)

## 5) Where to go next

- Add more templates in `src/data/habits` and extend `ensureToday()`
- Create a “Plan Builder” wizard that converts template + answers into a 7-day schedule
- Add reminders (web push) using `lib/notifications.ts`
- Add an Analytics backend (PostHog or GA) using `lib/analytics.ts`
- Build a B2B mode (multi-user teams) by swapping storage to an API

---

Happy building!
