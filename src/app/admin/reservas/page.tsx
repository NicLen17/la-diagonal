import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDataAccess } from "@/lib/data";
import { ReservationsManager } from "@/components/admin/reservations-manager";

export default async function AdminReservasPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [reservations, courts] = await Promise.all([
    db.reservations.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Reservas"
        description="Revisá pendientes, confirmá turnos y consultá la agenda."
      />
      <ReservationsManager reservations={reservations} courts={courts} />
    </div>
  );
}
