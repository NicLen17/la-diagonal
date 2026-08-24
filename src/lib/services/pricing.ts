import type { Court, PriceRule } from "@/lib/data/types";

function timeToMinutes(time: string): number {
  if (time === "00:00") return 24 * 60;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function ruleApplies(rule: PriceRule, at: Date): boolean {
  if (!rule.isActive) return false;
  const day = at.getDay();
  if (!rule.daysOfWeek.includes(day)) return false;
  const minutes = at.getHours() * 60 + at.getMinutes();
  const start = timeToMinutes(rule.startsAt);
  let end = timeToMinutes(rule.endsAt);
  if (end <= start) end += 24 * 60;
  let cursor = minutes;
  if (cursor < start && end > 24 * 60) cursor += 24 * 60;
  return cursor >= start && cursor < end;
}

export function resolvePrice(
  court: Court,
  startsAt: Date,
  rules: PriceRule[],
): number {
  const applicable = rules
    .filter(
      (r) =>
        (r.courtId === null || r.courtId === court.id) && ruleApplies(r, startsAt),
    )
    .sort((a, b) => b.priority - a.priority);

  let price = court.basePriceArs;
  for (const rule of applicable) {
    if (rule.priceArs !== null) {
      price = rule.priceArs;
      break;
    }
  }
  for (const rule of applicable) {
    if (rule.surchargeArs) {
      price += rule.surchargeArs;
    }
  }
  return price;
}

export function formatArs(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
