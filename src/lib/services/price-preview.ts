import type { Slot } from "@/lib/data/types";

export type PriceBand = {
  startsAt: string;
  endsAt: string;
  priceArs: number;
  available: boolean;
  count: number;
  signature: string;
};

/** Merge only adjacent slots with the same amount, availability and explanation. */
export function groupPriceSlots(
  slots: Slot[],
  signature: (slot: Slot) => string,
): PriceBand[] {
  const bands: PriceBand[] = [];
  for (const slot of slots) {
    const key = signature(slot);
    const previous = bands.at(-1);
    if (
      previous &&
      previous.endsAt === slot.startsAt &&
      previous.priceArs === slot.priceArs &&
      previous.available === slot.available &&
      previous.signature === key
    ) {
      previous.endsAt = slot.endsAt;
      previous.count++;
    } else {
      bands.push({
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        priceArs: slot.priceArs,
        available: slot.available,
        count: 1,
        signature: key,
      });
    }
  }
  return bands;
}
