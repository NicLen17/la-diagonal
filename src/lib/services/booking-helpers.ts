import type { Slot, Sport } from "@/lib/data/types";
import { sportSchema } from "@/lib/data/schemas";
import { formatTimeLabel } from "@/lib/services/availability";
import { toDateInputValue } from "@/lib/utils";

export type BookingView = "mapa" | "lista";

export function parseSportParam(value: string | undefined): Sport | undefined {
  if (!value) return undefined;
  const parsed = sportSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function parseViewParam(value: string | undefined): BookingView {
  return value === "lista" ? "lista" : "mapa";
}

export function collectHourLabels(slotsByCourt: Record<string, Slot[]>): string[] {
  const labels = new Set<string>();
  for (const slots of Object.values(slotsByCourt)) {
    for (const slot of slots) {
      labels.add(formatTimeLabel(slot.startsAt));
    }
  }
  return [...labels].sort((a, b) => a.localeCompare(b, "es-AR"));
}

export function findNextAvailableHour(
  slotsByCourt: Record<string, Slot[]>,
  date: Date,
): string | null {
  const hours = collectHourLabels(slotsByCourt);
  if (hours.length === 0) return null;

  const now = new Date();
  const isToday = toDateInputValue(date) === toDateInputValue(now);

  for (const hour of hours) {
    const hasAvailable = Object.values(slotsByCourt).some((slots) =>
      slots.some(
        (slot) =>
          slot.available &&
          formatTimeLabel(slot.startsAt) === hour &&
          (!isToday || new Date(slot.startsAt) > now),
      ),
    );
    if (hasAvailable) return hour;
  }

  return hours[0] ?? null;
}

export function findStartsAtForHour(
  slotsByCourt: Record<string, Slot[]>,
  hour: string,
): string | null {
  for (const slots of Object.values(slotsByCourt)) {
    const match = slots.find((slot) => formatTimeLabel(slot.startsAt) === hour);
    if (match) return match.startsAt;
  }
  return null;
}

export function buildBookingSearchParams(params: {
  fecha: string;
  deporte?: Sport;
  hora?: string;
  cancha?: string;
  vista?: BookingView;
}): string {
  const sp = new URLSearchParams();
  sp.set("fecha", params.fecha);
  if (params.deporte) sp.set("deporte", params.deporte);
  if (params.hora) sp.set("hora", params.hora);
  if (params.cancha) sp.set("cancha", params.cancha);
  if (params.vista === "lista") sp.set("vista", "lista");
  return sp.toString();
}
