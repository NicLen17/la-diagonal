import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  DollarSign,
  Map,
  Trophy,
  TrendingUp,
  CheckCircle2,
  SlidersHorizontal,
  Volleyball,
} from "lucide-react";
import { getDataAccess } from "@/lib/data";
import { computeDashboardStats } from "@/lib/services/admin-stats";
import { formatArs } from "@/lib/services/pricing";
import { PendingReservationsList } from "@/components/admin/reservation-actions";
import { DashboardHourChart } from "@/components/admin/dashboard-charts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTimeLabel } from "@/lib/services/availability";
import { venueDateKey } from "@/lib/services/venue-time";

export default async function AdminDashboardPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [reservations, courts] = await Promise.all([
    db.reservations.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
  ]);
  const now = new Date();
  const stats = computeDashboardStats(reservations, now);
  const today = venueDateKey(now);
  const todayReservations = reservations
    .filter(
      (r) =>
        venueDateKey(new Date(r.startsAt)) === today &&
        ["pending", "confirmed"].includes(r.status),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const activeCourts = courts.filter((c) => c.isActive).length;
  const upcoming = todayReservations.filter((r) => new Date(r.endsAt) > now);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: venue.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);
  const metrics = [
    {
      label: "Reservas por revisar",
      value: String(stats.pendingCount),
      hint: stats.pendingCount ? "Necesitan tu confirmación" : "Todo al día",
      icon: Clock,
      href: "/admin/reservas?status=pending",
      color: stats.pendingCount
        ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        : "border-border bg-card",
      iconColor: "bg-amber-200/60 text-amber-800",
    },
    {
      label: "Confirmadas hoy",
      value: String(stats.confirmedTodayCount),
      hint: `${todayReservations.length} turnos en la agenda de hoy`,
      icon: Trophy,
      href: "/admin/reservas?tab=agenda",
      color: "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950",
      iconColor: "bg-sky-100 text-sky-700",
    },
    {
      label: "Ingresos de la semana",
      value: formatArs(stats.weeklyRevenueArs),
      hint: "Total de reservas confirmadas · lun–dom",
      icon: DollarSign,
      href: "/admin/reservas?status=confirmed",
      color:
        "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
      iconColor: "bg-emerald-100 text-emerald-800",
    },
    {
      label: "Hora de mayor demanda",
      value: stats.peakHourLabel ?? "Sin datos",
      hint: "Según confirmaciones de esta semana",
      icon: TrendingUp,
      href: "#demanda",
      color: "border-border bg-card",
      iconColor: "bg-violet-100 text-violet-700",
    },
  ];
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Dashboard"
        description={`${venue.name} · ${dateLabel}`}
        actions={
          <>
            <Button asChild>
              <Link href="/admin/reservas">
                <CalendarDays aria-hidden="true" />
                Gestionar reservas
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/canchas?vista=mapa">
                <Map aria-hidden="true" />
                Ver predio
              </Link>
            </Button>
          </>
        }
      />
      <div className="grid gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
        {metrics.map(
          ({ label, value, hint, icon: Icon, href, color, iconColor }) => (
            <Link
              key={label}
              href={href}
              className={`group min-w-0 rounded-2xl border p-3 sm:p-4 transition-shadow hover:shadow-md ${color}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold">{label}</span>
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 truncate text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
                {value}
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs opacity-75">{hint}</p>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </div>
            </Link>
          ),
        )}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Agenda de hoy</CardTitle>
                  <CardDescription className="mt-1">
                    {upcoming.length} turnos en curso o por comenzar
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/reservas?tab=agenda">
                    Ver agenda
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayReservations.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <CalendarDays
                    className="mx-auto mb-2 size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="font-medium">Todavía no hay turnos para hoy</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Las próximas reservas aparecerán acá.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {todayReservations.slice(0, 6).map((res) => (
                    <div
                      key={res.id}
                      className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="w-16 shrink-0 rounded-lg bg-muted px-2 py-2 text-center">
                        <p className="font-bold tabular-nums">
                          {formatTimeLabel(res.startsAt)}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {formatTimeLabel(res.endsAt)}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {res.court.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {res.customer.fullName}
                        </p>
                        {res.customer.phoneE164 ? (
                          <a
                            className="mt-1 inline-block text-xs font-medium text-emerald-700 underline underline-offset-4 dark:text-emerald-300"
                            href={`https://wa.me/${res.customer.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${res.customer.fullName}, te escribimos sobre tu reserva ${res.code}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        ) : null}
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-semibold tabular-nums">
                          {formatArs(res.priceArs)}
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            res.status === "pending"
                              ? "mt-1 border-amber-300 bg-amber-50 text-amber-900"
                              : "mt-1 border-emerald-200 text-emerald-700 dark:text-emerald-300"
                          }
                        >
                          {res.status === "pending"
                            ? "Por confirmar"
                            : "Confirmada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card id="demanda" className="scroll-mt-6">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>Demanda por horario</CardTitle>
                  <CardDescription className="mt-1">
                    Turnos confirmados durante la semana actual
                  </CardDescription>
                </div>
                <Badge variant="outline">Lunes a domingo</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DashboardHourChart data={stats.hourlyConfirmed} />
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0 space-y-5">
          <PendingReservationsList reservations={stats.pendingRecent} />
          <Card>
            <CardHeader>
              <CardTitle>Tu complejo, a mano</CardTitle>
              <CardDescription>
                {activeCourts} canchas activas · {courts.length - activeCourts}{" "}
                inactivas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                {
                  href: "/admin/canchas",
                  title: "Canchas y predio",
                  detail: "Tarifas base, duración y distribución",
                  icon: Volleyball,
                },
                {
                  href: "/admin/precios",
                  title: "Precios y recargos",
                  detail: "Revisá el precio final antes de publicarlo",
                  icon: DollarSign,
                },
                {
                  href: "/admin/horarios",
                  title: "Horarios y cierres",
                  detail: "Apertura semanal y mantenimiento",
                  icon: Clock,
                },
                {
                  href: "/admin/configuracion",
                  title: "Configuración",
                  detail: "Datos bancarios, contacto y seña",
                  icon: SlidersHorizontal,
                },
              ].map(({ href, title, detail, icon: Icon }) => (
                <Link
                  href={href}
                  key={href}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent"
                >
                  <Icon
                    className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {detail}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              ))}
              {stats.pendingCount === 0 ? (
                <p className="flex items-center gap-2 pt-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  No tenés confirmaciones pendientes.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
