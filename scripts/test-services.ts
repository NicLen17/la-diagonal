import assert from "node:assert/strict";
import {
  resolvePrice,
  resolvePriceBreakdown,
} from "../src/lib/services/pricing";
import { groupPriceSlots } from "../src/lib/services/price-preview";
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

// The highest-priority fixed price wins; ALL applicable adjustments still stack.
const fixedRules: PriceRule[] = [
  ...rules,
  {
    ...rules[0],
    id: "fixed-low",
    priceArs: 15000,
    surchargeArs: 1000,
    priority: 5,
  },
  {
    ...rules[0],
    id: "fixed-high",
    priceArs: 20000,
    surchargeArs: null,
    priority: 20,
  },
  {
    ...rules[0],
    id: "discount",
    priceArs: null,
    surchargeArs: -500,
    priority: 100,
  },
  {
    ...rules[0],
    id: "inactive",
    priceArs: 1,
    surchargeArs: 90000,
    priority: 200,
    isActive: false,
  },
  {
    ...rules[0],
    id: "other-court",
    courtId: "other",
    priceArs: 1,
    surchargeArs: 90000,
    priority: 200,
  },
];
const breakdown = resolvePriceBreakdown(court, mondayNight, fixedRules);
assert.equal(breakdown.fixedRule?.id, "fixed-high");
assert.equal(breakdown.base, 20000);
assert.equal(breakdown.total, 23500);
assert.equal(resolvePrice(court, mondayNight, fixedRules), breakdown.total);
assert.equal(
  resolvePrice(court, new Date("2026-08-24T18:00:00-03:00"), rules),
  13000,
);
assert.equal(
  resolvePrice(court, new Date("2026-08-24T17:59:00-03:00"), rules),
  10000,
);

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
const bands = groupPriceSlots(slots, () => "base");
assert.equal(bands.length, 1);
assert.equal(bands[0].count, 3);
assert.equal(bands[0].startsAt, slots[0].startsAt);
assert.equal(bands[0].endsAt, slots[2].endsAt);
assert.equal(
  groupPriceSlots([slots[0], slots[2]], () => "base").length,
  2,
  "Never merge across a gap",
);
assert.equal(
  groupPriceSlots(slots, (slot) => slot.startsAt).length,
  3,
  "Equal amounts with different explanations remain separate",
);
assert.equal(
  groupPriceSlots(
    [slots[0], { ...slots[1], available: false }, slots[2]],
    () => "base",
  ).length,
  3,
  "Closures split price bands",
);
assert.deepEqual(
  groupPriceSlots([], () => ""),
  [],
);
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
