import Link from "next/link";
import {
  ClockIcon,
  DollarSignIcon,
  LandPlotIcon,
  MessageCircleIcon,
  PercentIcon,
  PlusIcon,
  TrophyIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import { getDataAccess } from "@/lib/data";
import { computeDashboardStats } from "@/lib/services/admin-stats";
import { formatArs } from "@/lib/services/pricing";
import { PendingReservationsList } from "@/components/admin/reservation-actions";
import { DashboardHourChart } from "@/components/admin/dashboard-charts";
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

export default async function AdminDashboardPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [reservations, courts] = await Promise.all([
    db.reservations.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
  ]);
  const stats = computeDashboardStats(reservations);

  const todayIso = new Date().toISOString().split("T")[0];
  const todayReservations = reservations
    .filter((r) => r.startsAt.startsWith(todayIso))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
            <ZapIcon className="size-4" />
            <span>Centro de Control Operativo</span>
          </div>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-foreground sm:text-4xl">
            {venue.name}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitoreo en tiempo real de canchas, turnos, señas y ocupación en Tafí Viejo.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button asChild className="bg-lime-400 font-bold text-navy-950 hover:bg-lime-300 h-11 px-5">
            <Link href="/admin/reservas">
              <PlusIcon className="size-4 mr-1.5" />
              Nueva Reserva
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 px-4 text-xs font-semibold">
            <Link href="/admin/mapa">
              <LandPlotIcon className="size-4 mr-1.5 text-lime-500" />
              Mapa en Vivo
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Weekly Revenue */}
        <Card className="border-border bg-card shadow-sm hover:border-lime-400/50 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Ingresos Estimados
            </CardDescription>
            <div className="flex size-9 items-center justify-center rounded-xl bg-lime-400/10 text-lime-500">
              <DollarSignIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display tracking-tight sm:text-3xl text-foreground">
              {formatArs(stats.weeklyRevenueArs)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUpIcon className="size-3 text-lime-500" />
              <span>Proyección semanal activa</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Confirmed Today */}
        <Card className="border-border bg-card shadow-sm hover:border-lime-400/50 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Partidos Confirmados Hoy
            </CardDescription>
            <div className="flex size-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-500">
              <TrophyIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display tracking-tight sm:text-3xl text-foreground">
              {stats.confirmedTodayCount} <span className="text-xs font-normal text-muted-foreground font-sans">turnos</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              De {courts.length * 6} turnos totales disponibles
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Occupancy Rate */}
        <Card className="border-border bg-card shadow-sm hover:border-lime-400/50 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Ocupación del Predio
            </CardDescription>
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500">
              <PercentIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {stats.occupancyHint}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Horas pico: 19:00 a 23:00 hs
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Pending Holds/Deposits */}
        <Card className="border-border bg-card shadow-sm hover:border-amber-400/50 transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Señas por Validar
            </CardDescription>
            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-400/10 text-rose-500">
              <ClockIcon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold font-display tracking-tight sm:text-3xl text-foreground">
                {stats.pendingCount}
              </div>
              <Button asChild variant="outline" size="sm" className="text-xs h-8">
                <Link href="/admin/reservas?status=pending">Revisar</Link>
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Esperando comprobante de pago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Charts and Today's Schedule */}
        <div className="space-y-6 lg:col-span-7">
          {/* Chart Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display uppercase tracking-wide">
                    Demanda por Horario
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribución de turnos confirmados durante la semana
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Semana actual
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DashboardHourChart data={stats.hourlyConfirmed} />
            </CardContent>
          </Card>

          {/* Today's Agenda Preview */}
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-display uppercase tracking-wide">
                    Agenda de Partidos de Hoy
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Turnos programados para el día de la fecha
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-lime-500">
                  <Link href="/admin/reservas?tab=agenda">Ver agenda completa →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayReservations.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No hay partidos registrados para hoy todavía.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayReservations.slice(0, 5).map((res) => {
                    const waUrl = `https://wa.me/${res.customer.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${res.customer.fullName}, te escribimos de La Diagonal para confirmar tu turno de hoy a las ${formatTimeLabel(res.startsAt)} hs.`)}`;
                    return (
                      <div
                        key={res.id}
                        className="flex flex-col gap-2 rounded-2xl border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {formatTimeLabel(res.startsAt)} – {formatTimeLabel(res.endsAt)} hs
                            </span>
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {res.court.name}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-muted-foreground">
                            {res.customer.fullName} • {res.customer.phoneE164}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lime-500">
                            {formatArs(res.priceArs)}
                          </span>
                          <Button asChild variant="outline" size="sm" className="h-8 px-2.5 text-[11px]">
                            <a href={waUrl} target="_blank" rel="noreferrer">
                              <MessageCircleIcon className="size-3.5 mr-1 text-lime-500" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Approvals */}
        <div className="lg:col-span-5">
          <PendingReservationsList reservations={stats.pendingRecent} />
        </div>
      </div>
    </div>
  );
}
