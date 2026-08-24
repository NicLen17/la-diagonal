import { z } from "zod";

export const sportSchema = z.enum([
  "futbol_5",
  "futbol_7",
  "futbol_8",
  "futbol_9",
  "futbol_11",
  "futsal",
  "handball",
  "padel",
]);

export const paymentMethodSchema = z.enum([
  "cash",
  "deposit",
  "transfer_full",
]);

export const surfaceSchema = z.enum([
  "cesped_sintetico",
  "cesped_natural",
  "cemento",
  "parquet",
]);

export const customerInputSchema = z.object({
  fullName: z.string().min(2, "Ingresá tu nombre completo"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Email inválido",
    ),
  phone: z
    .string()
    .min(8, "Teléfono inválido")
    .regex(/^[\d\s+\-()]+$/, "Teléfono inválido"),
});

export const createHoldSchema = z.object({
  courtId: z.string().min(1),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
});

export const completeReservationSchema = customerInputSchema.extend({
  reservationId: z.string().min(1),
  paymentMethod: paymentMethodSchema,
  receiptFileName: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const lookupReservationSchema = z.object({
  code: z.string().min(4),
  phone: z.string().min(8),
});

export const courtInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  sport: sportSchema,
  description: z.string(),
  surface: surfaceSchema,
  hasLights: z.boolean(),
  slotDurationMinutes: z.number().int().positive(),
  basePriceArs: z.number().int().nonnegative(),
  planX_m: z.number().nonnegative(),
  planY_m: z.number().nonnegative(),
  planWidthM: z.number().positive(),
  planLengthM: z.number().positive(),
  planRotationDeg: z.number(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const priceRuleInputSchema = z.object({
  id: z.string().optional(),
  courtId: z.string().nullable(),
  name: z.string().min(2),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  priceArs: z.number().int().nonnegative().nullable(),
  surchargeArs: z.number().int().nullable(),
  priority: z.number().int(),
  isActive: z.boolean(),
});

export const venueHoursInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  opensAt: z.string(),
  closesAt: z.string(),
});

export const closureInputSchema = z.object({
  id: z.string().optional(),
  courtId: z.string().nullable(),
  reason: z.string().min(2),
  startsAt: z.string(),
  endsAt: z.string(),
});

export const venueConfigSchema = z.object({
  depositPercent: z.number().min(0).max(100),
  bankAlias: z.string().min(1),
  bankCbu: z.string().min(1),
  bankHolder: z.string().min(1),
  whatsappE164: z.string().min(8),
  planWidthM: z.number().positive(),
  planLengthM: z.number().positive(),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CreateHoldInput = z.infer<typeof createHoldSchema>;
export type CompleteReservationInput = z.infer<typeof completeReservationSchema>;
export type CourtInput = z.infer<typeof courtInputSchema>;
export type PriceRuleInput = z.infer<typeof priceRuleInputSchema>;
export type VenueConfigInput = z.infer<typeof venueConfigSchema>;
