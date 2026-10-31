import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { venueDateKey, venueDateTime } from "./services/venue-time";

export function toDateInputValue(date: Date): string {
  return venueDateKey(date);
}

export function parseDateInput(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Elegí una fecha válida");
  const result = venueDateTime(value, "12:00");
  if (!Number.isFinite(result.getTime()) || venueDateKey(result) !== value)
    throw new Error("Elegí una fecha válida");
  return result;
}
