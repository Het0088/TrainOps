import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string | Date): string {
  const date = typeof time === 'string' ? new Date(time) : time
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDelay(minutes: number): string {
  if (minutes === 0) return 'On Time'
  if (minutes > 0) return `+${minutes}m`
  return `${minutes}m early`
}

export function getTrainStatusColor(delay: number): 'green' | 'yellow' | 'red' {
  if (delay <= 5) return 'green'
  if (delay <= 15) return 'yellow'
  return 'red'
}

export function getPriorityBadge(priority: 'HIGH' | 'MEDIUM' | 'LOW'): string {
  switch (priority) {
    case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
}