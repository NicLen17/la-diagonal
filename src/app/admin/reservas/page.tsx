import { getDataAccess } from "@/lib/data";
import { ReservationsManager } from "@/components/admin/reservations-manager";
import { STATUS_LABELS } from "@/lib/data/types";

export default async function AdminReservasPage({
  searchParams,
}: PageProps<"/admin/reservas">) {
  const params = await searchParams;
  const defaultTab = params.tab === "agenda" ? "agenda" : "tabla";
  const defaultStatus = typeof params.status === "string" && params.status in STATUS_LABELS ? params.status : "all";

  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [reservations, courts] = await Promise.all([
    db.reservations.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Reservas</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná confirmaciones, contacto y agenda diaria
        </p>
      </div>
      <ReservationsManager
        reservations={reservations}
        courts={courts}
        defaultTab={defaultTab}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
