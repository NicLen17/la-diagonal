"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDataAccess } from "@/lib/data";
import {
  closureInputSchema,
  courtInputSchema,
  priceRuleInputSchema,
  venueConfigSchema,
  venueHoursInputSchema,
} from "@/lib/data/schemas";
import type { Court } from "@/lib/data/types";

const COOKIE = "ld_admin";

const ADMIN_PATHS = [
  "/admin",
  "/admin/mapa",
  "/admin/canchas",
  "/admin/reservas",
  "/admin/horarios",
  "/admin/precios",
  "/admin/configuracion",
] as const;

function revalidateAdmin() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/reservar");
}

export async function adminLogin(
  passcode: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expected = process.env.ADMIN_PASSCODE ?? "diagonal2026";
  if (passcode !== expected) {
    return { ok: false, error: "Clave de acceso incorrecta" };
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, passcode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
  revalidateAdmin();
}

export async function upsertCourt(raw: unknown) {
  const input = courtInputSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const court = await db.courts.upsert(venue.id, input);
  revalidateAdmin();
  return court;
}

export async function deleteCourt(id: string) {
  if (!id) throw new Error("ID requerido");
  const db = getDataAccess();
  await db.courts.remove(id);
  revalidateAdmin();
}

export async function updateCourtPlan(
  id: string,
  plan: Pick<
    Court,
    "planX_m" | "planY_m" | "planWidthM" | "planLengthM" | "planRotationDeg"
  >,
) {
  const db = getDataAccess();
  const court = await db.courts.updatePlan(id, plan);
  revalidateAdmin();
  return court;
}

export async function upsertPriceRule(raw: unknown) {
  const input = priceRuleInputSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const rule = await db.priceRules.upsert(venue.id, input);
  revalidateAdmin();
  return rule;
}

export async function deletePriceRule(id: string) {
  if (!id) throw new Error("ID requerido");
  const db = getDataAccess();
  await db.priceRules.remove(id);
  revalidateAdmin();
}

export async function upsertVenueHours(raw: unknown) {
  const input = venueHoursInputSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const existing = await db.venues.listVenueHours(venue.id);
  const idx = existing.findIndex((h) => h.dayOfWeek === input.dayOfWeek);
  const updated = [...existing];
  if (idx >= 0) {
    updated[idx] = { ...updated[idx], ...input };
  } else {
    updated.push({
      id: `hours-${input.dayOfWeek}`,
      venueId: venue.id,
      ...input,
    });
  }
  const hours = await db.venues.upsertVenueHours(venue.id, updated);
  revalidateAdmin();
  return hours;
}

export async function upsertClosure(raw: unknown) {
  const input = closureInputSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const closure = await db.closures.upsert(venue.id, input);
  revalidateAdmin();
  return closure;
}

export async function deleteClosure(id: string) {
  if (!id) throw new Error("ID requerido");
  const db = getDataAccess();
  await db.closures.remove(id);
  revalidateAdmin();
}

export async function updateVenueConfig(raw: unknown) {
  const input = venueConfigSchema.parse(raw);
  const db = getDataAccess();
  const venue = await db.venues.updateVenueConfig(input);
  revalidateAdmin();
  return venue;
}
