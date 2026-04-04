import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash);
}

export function getUserColor(userId: string): string {
  const hash = hashString(userId);
  const hue = hash % 360;
  // Fixed saturation + lightness = always vivid, never too dark/pale
  return `hsl(${hue}, 70%, 60%)`;
}