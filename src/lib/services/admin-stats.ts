import type { ReservationWithDetails } from "@/lib/data/types";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return endOfDay(end);
}

export type AdminDashboardStats = {
  pendingCount: number;
  confirmedTodayCount: number;
  weeklyRevenueArs: number;
  peakHourLabel: string | null;
  occupancyHint: string;
  pendingRecent: ReservationWithDetails[];
  hourlyConfirmed: { hour: string; count: number }[];
};

export function computeDashboardStats(
  reservations: ReservationWithDetails[],
  now = new Date(),
): AdminDashboardStats {
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const pending = reservations.filter((r) => r.status === "pending");
  const confirmedToday = reservations.filter(
    (r) =>
      r.status === "confirmed" &&
      new Date(r.startsAt) >= todayStart &&
      new Date(r.startsAt) <= todayEnd,
  );
  const confirmedThisWeek = reservations.filter(
    (r) =>
      r.status === "confirmed" &&
      new Date(r.startsAt) >= weekStart &&
      new Date(r.startsAt) <= weekEnd,
  );

  const hourCounts = new Map<number, number>();
  for (const r of confirmedThisWeek) {
    const hour = new Date(r.startsAt).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }

  let peakHour: number | null = null;
  let peakCount = 0;
  for (const [hour, count] of hourCounts) {
    if (count > peakCount) {
      peakCount = count;
      peakHour = hour;
    }
  }

  const peakHourLabel =
    peakHour !== null
      ? `${String(peakHour).padStart(2, "0")}:00`
      : null;

  const totalConfirmedWeek = confirmedThisWeek.length;
  const occupancyHint =
    totalConfirmedWeek === 0
      ? "Sin reservas confirmadas esta semana"
      : peakHourLabel
        ? `Hora pico: ${peakHourLabel} (${peakCount} reservas)`
        : `${totalConfirmedWeek} reservas confirmadas esta semana`;

  const hourlyConfirmed = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, "0")}:00`,
    count: hourCounts.get(hour) ?? 0,
  })).filter((h) => h.count > 0);

  return {
    pendingCount: pending.length,
    confirmedTodayCount: confirmedToday.length,
    weeklyRevenueArs: confirmedThisWeek.reduce((sum, r) => sum + r.priceArs, 0),
    peakHourLabel,
    occupancyHint,
    pendingRecent: pending.slice(0, 8),
    hourlyConfirmed,
  };
}

export const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;
