import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}
 
export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]
}
 
export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}
 
export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 6 + i)
    return d.toISOString().split("T")[0]
  })
}
 