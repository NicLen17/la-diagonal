import assert from "node:assert/strict";
import { resolvePrice } from "../src/lib/services/pricing";
import { generateSlots } from "../src/lib/services/availability";
import type { Court, PriceRule, VenueHours } from "../src/lib/data/types";

const court: Court = {
  id: "c1",
  venueId: "v1",
  name: "F5",
  sport: "futbol_5",
  description: "",
  surface: "cesped_sintetico",
  hasLights: true,
  slotDurationMinutes: 60,
  basePriceArs: 10000,
  planX_m: 0,
  planY_m: 0,
  planWidthM: 20,
  planLengthM: 10,
  planRotationDeg: 0,
  sortOrder: 1,
  isActive: true,
};

const rules: PriceRule[] = [
  {
    id: "r1",
    venueId: "v1",
    courtId: null,
    name: "Night",
    daysOfWeek: [1],
    startsAt: "18:00",
    endsAt: "00:00",
    priceArs: null,
    surchargeArs: 3000,
    priority: 10,
    isActive: true,
  },
];

const mondayNight = new Date(2026, 7, 24, 20, 0, 0);
assert.equal(resolvePrice(court, mondayNight, rules), 13000);

const mondayMorning = new Date(2026, 7, 24, 10, 0, 0);
assert.equal(resolvePrice(court, mondayMorning, rules), 10000);

const hours: VenueHours[] = [
  {
    id: "h1",
    venueId: "v1",
    dayOfWeek: 1,
    opensAt: "09:00",
    closesAt: "12:00",
  },
];

const slots = generateSlots({
  court,
  date: new Date(2026, 7, 24),
  venueHours: hours,
  reservations: [],
  closures: [],
  priceRules: rules,
});

assert.equal(slots.length, 3);
assert.equal(
  slots.every((s) => s.available),
  true,
);

const blocked = generateSlots({
  court,
  date: new Date(2026, 7, 24),
  venueHours: hours,
  reservations: [
    {
      id: "res1",
      code: "X",
      venueId: "v1",
      courtId: "c1",
      customerId: "cu",
      startsAt: new Date(2026, 7, 24, 10, 0, 0).toISOString(),
      endsAt: new Date(2026, 7, 24, 11, 0, 0).toISOString(),
      status: "confirmed",
      holdExpiresAt: null,
      paymentMethod: "cash",
      priceArs: 10000,
      depositArs: 0,
      receiptFileName: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  closures: [],
  priceRules: rules,
});

assert.equal(blocked.filter((s) => !s.available).length, 1);
console.log("availability + pricing tests passed");
