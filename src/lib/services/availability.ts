import type {
  Closure,
  Court,
  CourtAvailabilitySummary,
  PriceRule,
  Reservation,
  Slot,
  VenueHours,
} from "@/lib/data/types";
import { BLOCKING_STATUSES } from "@/lib/data/types";
import { resolvePrice } from "./pricing";

function parseTimeOnDate(dateIso: string, time: string): Date {
  const base = new Date(dateIso);
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  // closesAt "00:00" means midnight end-of-day → next day 00:00
  if (time === "00:00") {
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function generateSlots(params: {
  court: Court;
  date: Date;
  venueHours: VenueHours[];
  reservations: Reservation[];
  closures: Closure[];
  priceRules: PriceRule[];
}): Slot[] {
  const { court, date, venueHours, reservations, closures, priceRules } = params;
  const day = date.getDay();
  const hours = venueHours.find((h) => h.dayOfWeek === day);
  if (!hours) return [];

  const dayStart = parseTimeOnDate(date.toISOString(), hours.opensAt);
  const dayEnd = parseTimeOnDate(date.toISOString(), hours.closesAt);
  const durationMs = court.slotDurationMinutes * 60_000;
  const slots: Slot[] = [];

  for (
    let cursor = new Date(dayStart);
    cursor.getTime() + durationMs <= dayEnd.getTime();
    cursor = new Date(cursor.getTime() + durationMs)
  ) {
    const ends = new Date(cursor.getTime() + durationMs);
    const blockingReservation = reservations.find(
      (r) =>
        r.courtId === court.id &&
        BLOCKING_STATUSES.includes(r.status) &&
        rangesOverlap(cursor, ends, new Date(r.startsAt), new Date(r.endsAt)),
    );
    const blockingClosure = closures.find(
      (c) =>
        (c.courtId === null || c.courtId === court.id) &&
        rangesOverlap(cursor, ends, new Date(c.startsAt), new Date(c.endsAt)),
    );

    let available = true;
    let reason: Slot["reason"];
    if (blockingReservation) {
      available = false;
      reason =
        blockingReservation.status === "hold" ? "hold" : "reservation";
    } else if (blockingClosure) {
      available = false;
      reason = "closure";
    }

    slots.push({
      courtId: court.id,
      startsAt: cursor.toISOString(),
      endsAt: ends.toISOString(),
      available,
      priceArs: resolvePrice(court, cursor, priceRules),
      reason,
    });
  }

  return slots;
}

export function summarizeCourtAvailability(
  slots: Slot[],
  selectedStartsAt: string | null,
): CourtAvailabilitySummary {
  const freeSlots = slots.filter((s) => s.available).length;
  const selected = selectedStartsAt
    ? slots.find((s) => s.startsAt === selectedStartsAt)
    : null;
  return {
    courtId: slots[0]?.courtId ?? "",
    totalSlots: slots.length,
    freeSlots,
    selectedSlotAvailable: selected ? selected.available : null,
  };
}

export function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
