import { BLOCKING_STATUSES, type Reservation, type ReservationWithDetails } from "../types";
import type { DataAccess } from "../ports";
import type {
  CompleteReservationInput,
  CourtInput,
  CreateHoldInput,
  CustomerInput,
  PriceRuleInput,
  VenueConfigInput,
} from "../schemas";
import {
  seedClosures,
  seedCourts,
  seedCustomers,
  seedHours,
  seedPriceRules,
  seedReservations,
  seedVenue,
} from "./seed";

type Store = {
  venue: typeof seedVenue;
  hours: typeof seedHours;
  courts: typeof seedCourts;
  priceRules: typeof seedPriceRules;
  closures: typeof seedClosures;
  customers: typeof seedCustomers;
  reservations: typeof seedReservations;
};

/** Bump when seed court plan geometry changes so the in-memory store reloads. */
const STORE_LAYOUT_VERSION = 2;

const globalForStore = globalThis as unknown as {
  __laDiagonalStore?: Store;
  __laDiagonalStoreLayout?: number;
};

function getStore(): Store {
  if (
    !globalForStore.__laDiagonalStore ||
    globalForStore.__laDiagonalStoreLayout !== STORE_LAYOUT_VERSION
  ) {
    globalForStore.__laDiagonalStore = {
      venue: structuredClone(seedVenue),
      hours: structuredClone(seedHours),
      courts: structuredClone(seedCourts),
      priceRules: structuredClone(seedPriceRules),
      closures: structuredClone(seedClosures),
      customers: structuredClone(seedCustomers),
      reservations: structuredClone(seedReservations),
    };
    globalForStore.__laDiagonalStoreLayout = STORE_LAYOUT_VERSION;
  }
  return globalForStore.__laDiagonalStore;
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function reservationCode(): string {
  return `LD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function withDetails(reservation: Reservation): ReservationWithDetails {
  const store = getStore();
  const customer = store.customers.find((c) => c.id === reservation.customerId);
  const court = store.courts.find((c) => c.id === reservation.courtId);
  if (!customer || !court) {
    throw new Error("Reservation missing related data");
  }
  return {
    ...reservation,
    customer,
    court,
    venue: store.venue,
  };
}

function assertNoOverlap(
  courtId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string,
): void {
  const store = getStore();
  const conflict = store.reservations.find(
    (r) =>
      r.courtId === courtId &&
      r.id !== excludeId &&
      BLOCKING_STATUSES.includes(r.status) &&
      overlaps(r.startsAt, r.endsAt, startsAt, endsAt),
  );
  if (conflict) {
    throw new Error("Ese turno ya no está disponible");
  }
}

export const mockDataAccess: DataAccess = {
  venues: {
    async getDefaultVenue() {
      return getStore().venue;
    },
    async updateVenueConfig(input: VenueConfigInput) {
      const store = getStore();
      store.venue = { ...store.venue, ...input };
      return store.venue;
    },
    async listVenueHours(venueId) {
      return getStore().hours.filter((h) => h.venueId === venueId);
    },
    async upsertVenueHours(venueId, hours) {
      const store = getStore();
      store.hours = hours.map((h) => ({ ...h, venueId }));
      return store.hours;
    },
  },
  courts: {
    async listByVenue(venueId) {
      return getStore()
        .courts.filter((c) => c.venueId === venueId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    async getById(id) {
      return getStore().courts.find((c) => c.id === id) ?? null;
    },
    async upsert(venueId, input: CourtInput) {
      const store = getStore();
      if (input.id) {
        const idx = store.courts.findIndex((c) => c.id === input.id);
        if (idx === -1) throw new Error("Cancha no encontrada");
        store.courts[idx] = {
          ...store.courts[idx],
          ...input,
          id: input.id,
          venueId,
        };
        return store.courts[idx];
      }
      const court = {
        ...input,
        id: uid("court"),
        venueId,
      };
      store.courts.push(court);
      return court;
    },
    async remove(id) {
      const store = getStore();
      store.courts = store.courts.filter((c) => c.id !== id);
    },
    async updatePlan(id, plan) {
      const store = getStore();
      const idx = store.courts.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("Cancha no encontrada");
      store.courts[idx] = { ...store.courts[idx], ...plan };
      return store.courts[idx];
    },
  },
  priceRules: {
    async listByVenue(venueId) {
      return getStore()
        .priceRules.filter((r) => r.venueId === venueId)
        .sort((a, b) => b.priority - a.priority);
    },
    async upsert(venueId, input: PriceRuleInput) {
      const store = getStore();
      if (input.id) {
        const idx = store.priceRules.findIndex((r) => r.id === input.id);
        if (idx === -1) throw new Error("Regla no encontrada");
        store.priceRules[idx] = {
          ...store.priceRules[idx],
          ...input,
          id: input.id,
          venueId,
        };
        return store.priceRules[idx];
      }
      const rule = { ...input, id: uid("rule"), venueId };
      store.priceRules.push(rule);
      return rule;
    },
    async remove(id) {
      const store = getStore();
      store.priceRules = store.priceRules.filter((r) => r.id !== id);
    },
  },
  closures: {
    async listByVenue(venueId) {
      return getStore().closures.filter((c) => c.venueId === venueId);
    },
    async upsert(venueId, input) {
      const store = getStore();
      if (input.id) {
        const idx = store.closures.findIndex((c) => c.id === input.id);
        if (idx === -1) throw new Error("Cierre no encontrado");
        store.closures[idx] = { ...store.closures[idx], ...input, venueId };
        return store.closures[idx];
      }
      const closure = { ...input, id: uid("closure"), venueId };
      store.closures.push(closure);
      return closure;
    },
    async remove(id) {
      const store = getStore();
      store.closures = store.closures.filter((c) => c.id !== id);
    },
  },
  reservations: {
    async listByVenue(venueId) {
      expireHoldsInternal();
      return getStore()
        .reservations.filter((r) => r.venueId === venueId)
        .map(withDetails)
        .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    },
    async listBlockingForCourtDate(courtId, dayStartIso, dayEndIso) {
      expireHoldsInternal();
      return getStore().reservations.filter(
        (r) =>
          r.courtId === courtId &&
          BLOCKING_STATUSES.includes(r.status) &&
          overlaps(r.startsAt, r.endsAt, dayStartIso, dayEndIso),
      );
    },
    async listBlockingForVenueDate(venueId, dayStartIso, dayEndIso) {
      expireHoldsInternal();
      return getStore().reservations.filter(
        (r) =>
          r.venueId === venueId &&
          BLOCKING_STATUSES.includes(r.status) &&
          overlaps(r.startsAt, r.endsAt, dayStartIso, dayEndIso),
      );
    },
    async getById(id) {
      expireHoldsInternal();
      const reservation = getStore().reservations.find((r) => r.id === id);
      return reservation ? withDetails(reservation) : null;
    },
    async getByCode(code) {
      expireHoldsInternal();
      const reservation = getStore().reservations.find(
        (r) => r.code.toLowerCase() === code.toLowerCase(),
      );
      return reservation ? withDetails(reservation) : null;
    },
    async findByCodeAndPhone(code, phoneDigits) {
      expireHoldsInternal();
      const reservation = getStore().reservations.find(
        (r) => r.code.toLowerCase() === code.toLowerCase(),
      );
      if (!reservation) return null;
      const details = withDetails(reservation);
      if (!digitsOnly(details.customer.phoneE164).endsWith(digitsOnly(phoneDigits))) {
        return null;
      }
      return details;
    },
    async createHold(venueId, input: CreateHoldInput, priceArs: number) {
      expireHoldsInternal();
      assertNoOverlap(input.courtId, input.startsAt, input.endsAt);
      const store = getStore();
      const venue = store.venue;
      const now = new Date();
      const holdExpiresAt = new Date(
        now.getTime() + venue.holdTtlMinutes * 60_000,
      ).toISOString();

      let guest = store.customers.find((c) => c.email === "hold@temp.local");
      if (!guest) {
        guest = {
          id: uid("cust"),
          fullName: "Hold temporal",
          email: "hold@temp.local",
          phoneE164: "5490000000000",
          authUserId: null,
          createdAt: now.toISOString(),
        };
        store.customers.push(guest);
      }

      const reservation: Reservation = {
        id: uid("res"),
        code: reservationCode(),
        venueId,
        courtId: input.courtId,
        customerId: guest.id,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "hold",
        holdExpiresAt,
        paymentMethod: "cash",
        priceArs,
        depositArs: 0,
        receiptFileName: null,
        notes: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      store.reservations.push(reservation);
      return reservation;
    },
    async complete(
      input: CompleteReservationInput,
      customerInput: CustomerInput,
      depositArs: number,
    ) {
      expireHoldsInternal();
      const store = getStore();
      const idx = store.reservations.findIndex((r) => r.id === input.reservationId);
      if (idx === -1) throw new Error("Reserva no encontrada");
      const current = store.reservations[idx];
      if (current.status !== "hold") {
        throw new Error("La reserva ya no está en hold");
      }
      if (current.holdExpiresAt && current.holdExpiresAt < new Date().toISOString()) {
        store.reservations[idx] = {
          ...current,
          status: "expired",
          updatedAt: new Date().toISOString(),
        };
        throw new Error("El hold expiró. Elegí el turno de nuevo.");
      }

      let customer =
        customerInput.email.trim() !== ""
          ? store.customers.find(
              (c) =>
                c.email.toLowerCase() === customerInput.email.toLowerCase(),
            )
          : store.customers.find(
              (c) => c.phoneE164 === normalizePhone(customerInput.phone),
            );
      if (!customer) {
        customer = {
          id: uid("cust"),
          fullName: customerInput.fullName,
          email: customerInput.email.trim(),
          phoneE164: normalizePhone(customerInput.phone),
          authUserId: null,
          createdAt: new Date().toISOString(),
        };
        store.customers.push(customer);
      } else {
        customer.fullName = customerInput.fullName;
        customer.phoneE164 = normalizePhone(customerInput.phone);
        if (customerInput.email.trim()) {
          customer.email = customerInput.email.trim();
        }
      }

      store.reservations[idx] = {
        ...current,
        customerId: customer.id,
        status: "pending",
        holdExpiresAt: null,
        paymentMethod: input.paymentMethod,
        depositArs,
        receiptFileName: input.receiptFileName ?? null,
        notes: input.notes ?? null,
        updatedAt: new Date().toISOString(),
      };
      return withDetails(store.reservations[idx]);
    },
    async updateStatus(id, status) {
      const store = getStore();
      const idx = store.reservations.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error("Reserva no encontrada");
      store.reservations[idx] = {
        ...store.reservations[idx],
        status,
        updatedAt: new Date().toISOString(),
      };
      return withDetails(store.reservations[idx]);
    },
    async expireHolds() {
      return expireHoldsInternal();
    },
  },
};

function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54") && digits[2] === "9") return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length >= 10) return `54${digits}`;
  return `549${digits}`;
}

function expireHoldsInternal(): number {
  const store = getStore();
  const now = new Date().toISOString();
  let count = 0;
  store.reservations = store.reservations.map((r) => {
    if (r.status === "hold" && r.holdExpiresAt && r.holdExpiresAt < now) {
      count += 1;
      return { ...r, status: "expired", updatedAt: now };
    }
    return r;
  });
  return count;
}
