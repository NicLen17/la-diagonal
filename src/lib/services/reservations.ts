"use server";

import { getDataAccess } from "@/lib/data";
import {
  completeReservationSchema,
  createHoldSchema,
  lookupReservationSchema,
} from "@/lib/data/schemas";
import { revalidatePath } from "next/cache";
import { generateSlots } from "./availability";
import { ownsBooking, rememberBooking, requireAdmin } from "./auth";
import { normalizePhone } from "./phone";
import { saveReceipt, removeReceipts } from "./receipts";
import { venueDayRange } from "./venue-time";

function revalidateReservations(code?: string) {
  for (const path of ["/reservar", "/demo", "/admin", "/admin/reservas"])
    revalidatePath(path);
  if (code) revalidatePath(`/reserva/${code}`);
}
export async function createHoldAction(raw: unknown) {
  const input = createHoldSchema.parse(raw);
  const start = new Date(input.startsAt);
  if (
    start.getTime() <= Date.now() ||
    start.getTime() > Date.now() + 90 * 86400000
  )
    throw new Error("Elegí un turno futuro dentro de los próximos 90 días");
  const db = getDataAccess();
  const availability = await getAvailabilityForDate(start.toISOString());
  const slot = availability.slotsByCourt[input.courtId]?.find(
    (s) =>
      s.startsAt === start.toISOString() &&
      s.endsAt === new Date(input.endsAt).toISOString() &&
      s.available,
  );
  if (!slot)
    throw new Error(
      "Ese turno no está disponible. Actualizá la fecha o elegí otro horario.",
    );
  const reservation = await db.reservations.createHold(
    availability.venue.id,
    input,
    slot.priceArs,
  );
  await rememberBooking(reservation.id, reservation.code);
  revalidateReservations();
  return { id: reservation.id, holdExpiresAt: reservation.holdExpiresAt };
}
export async function completeReservationAction(form: FormData) {
  if (!(form instanceof FormData))
    throw new Error("Completá los datos de la reserva");
  const input = completeReservationSchema
    .omit({ receiptPath: true, receiptFileName: true })
    .parse(Object.fromEntries(form));
  if (!(await ownsBooking(input.reservationId)))
    throw new Error("Volvé a elegir el turno desde este dispositivo");
  normalizePhone(input.phone);
  const db = getDataAccess();
  const current = await db.reservations.getById(input.reservationId);
  if (!current || current.status !== "hold")
    throw new Error("El turno expiró o ya se completó. Elegí otro horario.");
  const needsReceipt = input.paymentMethod !== "cash";
  let receipt: { path: string; name: string } | undefined;
  if (needsReceipt) {
    const file = form.get("receipt");
    if (!(file instanceof File) || !file.size)
      throw new Error("Adjuntá el comprobante de transferencia");
    receipt = await saveReceipt(current.id, file);
  }
  let reservation;
  try {
    const amount =
      input.paymentMethod === "deposit"
        ? Math.round((current.priceArs * current.venue.depositPercent) / 100)
        : input.paymentMethod === "transfer_full"
          ? current.priceArs
          : 0;
    reservation = await db.reservations.complete(
      { ...input, receiptFileName: receipt?.name, receiptPath: receipt?.path },
      { fullName: input.fullName, email: input.email, phone: input.phone },
      amount,
    );
  } catch (error) {
    if (receipt) await removeReceipts([receipt.path]).catch(() => {});
    throw error;
  }
  await rememberBooking(reservation.id, reservation.code);
  revalidateReservations(reservation.code);
  return { code: reservation.code };
}
export async function lookupReservationAction(raw: unknown) {
  const input = lookupReservationSchema.parse(raw);
  const result = await getDataAccess().reservations.findByCodeAndPhone(
    input.code,
    normalizePhone(input.phone),
  );
  if (result) await rememberBooking(result.id, result.code);
  return result ? { ...result, receiptPath: undefined } : null;
}
export async function updateReservationStatusAction(
  id: string,
  status: "confirmed" | "cancelled" | "pending",
) {
  await requireAdmin();
  if (!["confirmed", "cancelled", "pending"].includes(status))
    throw new Error("Estado inválido");
  const db = getDataAccess();
  const current = await db.reservations.getById(id);
  if (!current || !["pending", "confirmed"].includes(current.status))
    throw new Error("Solo podés gestionar reservas registradas");
  const reservation = await db.reservations.updateStatus(id, status);
  revalidateReservations(reservation.code);
  return { status: reservation.status };
}
export async function getAvailabilityForDate(dateIso: string) {
  const date = new Date(dateIso);
  if (!Number.isFinite(date.getTime()))
    throw new Error("Elegí una fecha válida");
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const range = venueDayRange(date);
  const [courts, hours, reservations, closures, rules] = await Promise.all([
    db.courts.listByVenue(venue.id),
    db.venues.listVenueHours(venue.id),
    db.reservations.listBlockingForVenueDate(
      venue.id,
      range.start.toISOString(),
      range.end.toISOString(),
    ),
    db.closures.listByVenue(venue.id),
    db.priceRules.listByVenue(venue.id),
  ]);
  const active = courts.filter((c) => c.isActive);
  return {
    venue,
    courts: active,
    rules,
    slotsByCourt: Object.fromEntries(
      active.map((court) => [
        court.id,
        generateSlots({
          court,
          date,
          venueHours: hours,
          reservations,
          closures,
          priceRules: rules,
        }).map((slot) => ({
          ...slot,
          available:
            slot.available && new Date(slot.startsAt).getTime() > Date.now(),
        })),
      ]),
    ),
  };
}
