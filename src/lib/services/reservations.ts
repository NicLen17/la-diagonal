"use server";

import { getDataAccess } from "@/lib/data";
import {
  completeReservationSchema,
  createHoldSchema,
  lookupReservationSchema,
} from "@/lib/data/schemas";
import { generateSlots } from "./availability";
import { resolvePrice } from "./pricing";
import { revalidatePath } from "next/cache";

export async function createHoldAction(raw: unknown) {
  const input = createHoldSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const court = await db.courts.getById(input.courtId);
  if (!court || !court.isActive) {
    throw new Error("Cancha no disponible");
  }
  const rules = await db.priceRules.listByVenue(venue.id);
  const price = resolvePrice(court, new Date(input.startsAt), rules);
  const reservation = await db.reservations.createHold(venue.id, input, price);
  revalidatePath("/reservar");
  revalidatePath("/admin/reservas");
  return reservation;
}

export async function completeReservationAction(raw: unknown) {
  const input = completeReservationSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();

  if (
    (input.paymentMethod === "deposit" ||
      input.paymentMethod === "transfer_full") &&
    !input.receiptFileName
  ) {
    throw new Error("Adjuntá el comprobante de transferencia");
  }

  const depositArs =
    input.paymentMethod === "deposit"
      ? Math.round(
          ((await db.reservations.getById(input.reservationId))?.priceArs ?? 0) *
            (venue.depositPercent / 100),
        )
      : input.paymentMethod === "transfer_full"
        ? (await db.reservations.getById(input.reservationId))?.priceArs ?? 0
        : 0;

  const reservation = await db.reservations.complete(
    input,
    {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
    },
    depositArs,
  );

  revalidatePath("/reservar");
  revalidatePath("/admin/reservas");
  revalidatePath(`/reserva/${reservation.code}`);
  return reservation;
}

export async function lookupReservationAction(raw: unknown) {
  const input = lookupReservationSchema.parse(raw);
  const db = getDataAccess();
  return db.reservations.findByCodeAndPhone(input.code, input.phone);
}

export async function updateReservationStatusAction(
  id: string,
  status: "confirmed" | "cancelled" | "pending",
) {
  const db = getDataAccess();
  const reservation = await db.reservations.updateStatus(id, status);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  revalidatePath("/reservar");
  return reservation;
}

export async function getAvailabilityForDate(dateIso: string, sport?: string) {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [courts, hours, reservations, closures, rules] = await Promise.all([
    db.courts.listByVenue(venue.id),
    db.venues.listVenueHours(venue.id),
    db.reservations.listBlockingForVenueDate(
      venue.id,
      new Date(new Date(dateIso).setHours(0, 0, 0, 0)).toISOString(),
      new Date(new Date(dateIso).setHours(23, 59, 59, 999)).toISOString(),
    ),
    db.closures.listByVenue(venue.id),
    db.priceRules.listByVenue(venue.id),
  ]);

  const date = new Date(dateIso);
  const filtered = courts.filter(
    (c) => c.isActive && (!sport || c.sport === sport),
  );

  return {
    venue,
    courts: filtered,
    rules,
    slotsByCourt: Object.fromEntries(
      filtered.map((court) => [
        court.id,
        generateSlots({
          court,
          date,
          venueHours: hours,
          reservations,
          closures,
          priceRules: rules,
        }),
      ]),
    ),
  };
}
