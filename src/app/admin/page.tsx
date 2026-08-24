import Link from "next/link";
import { getDataAccess } from "@/lib/data";
import { computeDashboardStats } from "@/lib/services/admin-stats";
import { formatArs } from "@/lib/services/pricing";
import { PendingReservationsList } from "@/components/admin/reservation-actions";
import { DashboardHourChart } from "@/components/admin/dashboard-charts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const reservations = await db.reservations.listByVenue(venue.id);
  const stats = computeDashboardStats(reservations);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen operativo de {venue.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl">{stats.pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/admin/reservas?status=pending">Ver reservas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmadas hoy</CardDescription>
            <CardTitle className="text-3xl">
              {stats.confirmedTodayCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos estimados (semana)</CardDescription>
            <CardTitle className="text-2xl">
              {formatArs(stats.weeklyRevenueArs)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ocupación</CardDescription>
            <CardTitle className="text-base font-medium leading-snug">
              {stats.occupancyHint}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reservas por hora</CardTitle>
            <CardDescription>Confirmadas esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardHourChart data={stats.hourlyConfirmed} />
          </CardContent>
        </Card>
        <PendingReservationsList reservations={stats.pendingRecent} />
      </div>
    </div>
  );
}
