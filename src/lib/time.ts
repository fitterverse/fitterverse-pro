import { format, startOfToday } from 'date-fns'

export function todayKey(d = new Date()) {
  return format(d, 'yyyy-MM-dd')
}

export function humanDate(d = new Date()) {
  return format(d, 'EEE, MMM d')
}

export const startToday = startOfToday();
