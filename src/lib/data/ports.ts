import type {
  Closure,
  Court,
  Customer,
  PriceRule,
  Reservation,
  ReservationWithDetails,
  Venue,
  VenueHours,
} from "./types";
import type {
  CompleteReservationInput,
  CourtInput,
  CreateHoldInput,
  CustomerInput,
  PriceRuleInput,
  VenueConfigInput,
} from "./schemas";

export type VenueRepository = {
  getDefaultVenue: () => Promise<Venue>;
  updateVenueConfig: (input: VenueConfigInput) => Promise<Venue>;
  listVenueHours: (venueId: string) => Promise<VenueHours[]>;
  upsertVenueHours: (venueId: string, hours: VenueHours[]) => Promise<VenueHours[]>;
};

export type CourtRepository = {
  listByVenue: (venueId: string) => Promise<Court[]>;
  getById: (id: string) => Promise<Court | null>;
  upsert: (venueId: string, input: CourtInput) => Promise<Court>;
  remove: (id: string) => Promise<void>;
  updatePlan: (
    id: string,
    plan: Pick<
      Court,
      | "planX_m"
      | "planY_m"
      | "planWidthM"
      | "planLengthM"
      | "planRotationDeg"
    >,
  ) => Promise<Court>;
};

export type PriceRuleRepository = {
  listByVenue: (venueId: string) => Promise<PriceRule[]>;
  upsert: (venueId: string, input: PriceRuleInput) => Promise<PriceRule>;
  remove: (id: string) => Promise<void>;
};

export type ClosureRepository = {
  listByVenue: (venueId: string) => Promise<Closure[]>;
  upsert: (venueId: string, input: Omit<Closure, "id" | "venueId"> & { id?: string }) => Promise<Closure>;
  remove: (id: string) => Promise<void>;
};

export type ReservationRepository = {
  listByVenue: (venueId: string) => Promise<ReservationWithDetails[]>;
  listBlockingForCourtDate: (
    courtId: string,
    dayStartIso: string,
    dayEndIso: string,
  ) => Promise<Reservation[]>;
  listBlockingForVenueDate: (
    venueId: string,
    dayStartIso: string,
    dayEndIso: string,
  ) => Promise<Reservation[]>;
  getById: (id: string) => Promise<ReservationWithDetails | null>;
  getByCode: (code: string) => Promise<ReservationWithDetails | null>;
  findByCodeAndPhone: (
    code: string,
    phoneDigits: string,
  ) => Promise<ReservationWithDetails | null>;
  createHold: (
    venueId: string,
    input: CreateHoldInput,
    priceArs: number,
  ) => Promise<Reservation>;
  complete: (
    input: CompleteReservationInput,
    customer: CustomerInput,
    depositArs: number,
  ) => Promise<ReservationWithDetails>;
  updateStatus: (
    id: string,
    status: Reservation["status"],
  ) => Promise<ReservationWithDetails>;
  expireHolds: () => Promise<number>;
};

export type DataAccess = {
  venues: VenueRepository;
  courts: CourtRepository;
  priceRules: PriceRuleRepository;
  closures: ClosureRepository;
  reservations: ReservationRepository;
};

export type { Customer };
