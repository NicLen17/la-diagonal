export type Sport =
  | "futbol_5"
  | "futbol_7"
  | "futbol_8"
  | "futbol_9"
  | "futbol_11"
  | "futsal"
  | "handball"
  | "padel";

export type ReservationStatus =
  | "hold"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "expired";

export type PaymentMethod = "cash" | "deposit" | "transfer_full";

export type Surface =
  | "cesped_sintetico"
  | "cesped_natural"
  | "cemento"
  | "parquet";

export type Venue = {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  province: string;
  phoneE164: string;
  whatsappE164: string;
  timezone: string;
  planWidthM: number;
  planLengthM: number;
  depositPercent: number;
  bankAlias: string;
  bankCbu: string;
  bankHolder: string;
  holdTtlMinutes: number;
  instagramUrl: string;
  facebookUrl: string;
  whatsappContactUrl: string;
};

export type Court = {
  id: string;
  venueId: string;
  name: string;
  sport: Sport;
  description: string;
  surface: Surface;
  hasLights: boolean;
  slotDurationMinutes: number;
  basePriceArs: number;
  planX_m: number;
  planY_m: number;
  planWidthM: number;
  planLengthM: number;
  planRotationDeg: number;
  sortOrder: number;
  isActive: boolean;
};

export type VenueHours = {
  id: string;
  venueId: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
};

export type CourtHourOverride = {
  id: string;
  courtId: string;
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

export type PriceRule = {
  id: string;
  venueId: string;
  courtId: string | null;
  name: string;
  daysOfWeek: number[];
  startsAt: string;
  endsAt: string;
  priceArs: number | null;
  surchargeArs: number | null;
  priority: number;
  isActive: boolean;
};

export type Closure = {
  id: string;
  venueId: string;
  courtId: string | null;
  reason: string;
  startsAt: string;
  endsAt: string;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phoneE164: string;
  authUserId: string | null;
  createdAt: string;
};

export type Reservation = {
  id: string;
  code: string;
  venueId: string;
  courtId: string;
  customerId: string;
  startsAt: string;
  endsAt: string;
  status: ReservationStatus;
  holdExpiresAt: string | null;
  paymentMethod: PaymentMethod;
  priceArs: number;
  depositArs: number;
  receiptFileName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Slot = {
  courtId: string;
  startsAt: string;
  endsAt: string;
  available: boolean;
  priceArs: number;
  reason?: "reservation" | "closure" | "hold";
};

export type CourtAvailabilitySummary = {
  courtId: string;
  totalSlots: number;
  freeSlots: number;
  selectedSlotAvailable: boolean | null;
};

export type ReservationWithDetails = Reservation & {
  customer: Customer;
  court: Court;
  venue: Venue;
};

export const SPORT_LABELS: Record<Sport, string> = {
  futbol_5: "Fútbol 5",
  futbol_7: "Fútbol 7",
  futbol_8: "Fútbol 8",
  futbol_9: "Fútbol 9",
  futbol_11: "Fútbol 11",
  futsal: "Futsal",
  handball: "Handball",
  padel: "Pádel",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  deposit: "Seña por transferencia",
  transfer_full: "Transferencia total",
};

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  hold: "En proceso",
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

export const BLOCKING_STATUSES: ReservationStatus[] = [
  "hold",
  "pending",
  "confirmed",
];
