import "server-only";
import type { DataAccess } from "../ports";
import type {
  Closure,
  Court,
  Customer,
  PriceRule,
  Reservation,
  ReservationWithDetails,
  Venue,
  VenueHours,
} from "../types";
import { DEFAULT_VENUE_ID } from "../mock/seed";
import { database, eq, rpc } from "./http";
import { normalizePhone } from "@/lib/services/phone";

const uid = () => crypto.randomUUID();
async function details(rows: Reservation[]): Promise<ReservationWithDetails[]> {
  if (!rows.length) return [];
  const [venues, courts, customers] = await Promise.all([
    database<Venue>("cm_venues"),
    database<Court>("cm_courts"),
    database<Customer>("cm_customers"),
  ]);
  return rows.map((r) => {
    const venue = venues.find((v) => v.id === r.venueId),
      court = courts.find((c) => c.id === r.courtId),
      customer = customers.find((c) => c.id === r.customerId);
    if (!venue || !court || !customer)
      throw new Error("Faltan datos de la reserva");
    return {
      ...r,
      startsAt: new Date(r.startsAt).toISOString(),
      endsAt: new Date(r.endsAt).toISOString(),
      holdExpiresAt: r.holdExpiresAt
        ? new Date(r.holdExpiresAt).toISOString()
        : null,
      venue,
      court,
      customer,
    };
  });
}
async function getReservation(field: "id" | "code", value: string) {
  await rpc("cm_expire_holds");
  return (
    (
      await details(
        await database<Reservation>(
          "cm_reservations",
          `${field}=${eq(value)}&limit=1`,
        ),
      )
    )[0] ?? null
  );
}
export const supabaseDataAccess: DataAccess = {
  venues: {
    async getDefaultVenue() {
      const [venue] = await database<Venue>(
        "cm_venues",
        `id=${eq(DEFAULT_VENUE_ID)}`,
      );
      if (!venue) throw new Error("Falta inicializar el complejo de demo");
      return venue;
    },
    async updateVenueConfig(input) {
      return (
        await database<Venue>(
          "cm_venues",
          `id=${eq(DEFAULT_VENUE_ID)}`,
          "PATCH",
          input,
        )
      )[0];
    },
    listVenueHours: (id) =>
      database<VenueHours>("cm_hours", `venueId=${eq(id)}&order=dayOfWeek`),
    async upsertVenueHours(id, hours) {
      return database<VenueHours>(
        "cm_hours",
        "on_conflict=venueId,dayOfWeek",
        "POST",
        hours.map((h) => ({ ...h, venueId: id })),
      );
    },
  },
  courts: {
    listByVenue: (id) =>
      database<Court>("cm_courts", `venueId=${eq(id)}&order=sortOrder`),
    async getById(id) {
      return (
        (
          await database<Court>(
            "cm_courts",
            `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}`,
          )
        )[0] ?? null
      );
    },
    async upsert(venueId, input) {
      return (
        await database<Court>("cm_courts", "", "POST", {
          ...input,
          id: input.id ?? uid(),
          venueId,
        })
      )[0];
    },
    async remove(id) {
      await database(
        "cm_courts",
        `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}`,
        "DELETE",
      );
    },
    async updatePlan(id, plan) {
      return (
        await database<Court>(
          "cm_courts",
          `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}`,
          "PATCH",
          plan,
        )
      )[0];
    },
  },
  priceRules: {
    listByVenue: (id) =>
      database<PriceRule>(
        "cm_price_rules",
        `venueId=${eq(id)}&order=priority.desc`,
      ),
    async upsert(venueId, input) {
      return (
        await database<PriceRule>("cm_price_rules", "", "POST", {
          ...input,
          id: input.id ?? uid(),
          venueId,
        })
      )[0];
    },
    async remove(id) {
      await database(
        "cm_price_rules",
        `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}`,
        "DELETE",
      );
    },
  },
  closures: {
    listByVenue: (id) => database<Closure>("cm_closures", `venueId=${eq(id)}`),
    async upsert(venueId, input) {
      return (
        await database<Closure>("cm_closures", "", "POST", {
          ...input,
          id: input.id ?? uid(),
          venueId,
        })
      )[0];
    },
    async remove(id) {
      await database(
        "cm_closures",
        `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}`,
        "DELETE",
      );
    },
  },
  reservations: {
    async listByVenue(id) {
      await rpc("cm_expire_holds");
      return details(
        await database<Reservation>(
          "cm_reservations",
          `venueId=${eq(id)}&order=startsAt.desc`,
        ),
      );
    },
    async listBlockingForCourtDate(id, start, end) {
      await rpc("cm_expire_holds");
      return database<Reservation>(
        "cm_reservations",
        `courtId=${eq(id)}&status=in.(hold,pending,confirmed)&startsAt=lt.${encodeURIComponent(end)}&endsAt=gt.${encodeURIComponent(start)}`,
      );
    },
    async listBlockingForVenueDate(id, start, end) {
      await rpc("cm_expire_holds");
      return database<Reservation>(
        "cm_reservations",
        `venueId=${eq(id)}&status=in.(hold,pending,confirmed)&startsAt=lt.${encodeURIComponent(end)}&endsAt=gt.${encodeURIComponent(start)}`,
      );
    },
    getById: (id) => getReservation("id", id),
    getByCode: (code) => getReservation("code", code.toUpperCase()),
    async findByCodeAndPhone(code, phone) {
      const reservation = await getReservation("code", code.toUpperCase());
      return reservation &&
        reservation.customer.phoneE164 === normalizePhone(phone)
        ? reservation
        : null;
    },
    async createHold(venueId, input, price) {
      const r = await rpc<Reservation>("cm_create_hold", {
        venue_id: venueId,
        court_id: input.courtId,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        price_ars: price,
      });
      return {
        ...r,
        startsAt: new Date(r.startsAt).toISOString(),
        endsAt: new Date(r.endsAt).toISOString(),
      };
    },
    async complete(input, customer) {
      const r = await rpc<Reservation>("cm_complete_reservation", {
        reservation_id: input.reservationId,
        customer: {
          fullName: customer.fullName,
          email: customer.email,
          phoneE164: normalizePhone(customer.phone),
        },
        payment: input.paymentMethod,
        receipt_name: input.receiptFileName ?? null,
        receipt_path: input.receiptPath ?? null,
        customer_notes: input.notes ?? null,
      });
      return (await details([r]))[0];
    },
    async updateStatus(id, status) {
      const rows = await database<Reservation>(
        "cm_reservations",
        `id=${eq(id)}&venueId=${eq(DEFAULT_VENUE_ID)}&status=in.(pending,confirmed)`,
        "PATCH",
        { status, updatedAt: new Date().toISOString() },
      );
      if (!rows.length) throw new Error("Esta reserva ya no admite cambios");
      return (await details(rows))[0];
    },
    expireHolds: () => rpc<number>("cm_expire_holds"),
  },
};
