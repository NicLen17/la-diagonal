import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDataAccess } from "@/lib/data";
import {
  ClosuresManager,
  HoursEditor,
} from "@/components/admin/hours-closures";

export default async function AdminHorariosPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [hours, closures, courts] = await Promise.all([
    db.venues.listVenueHours(venue.id),
    db.closures.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
  ]);

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Horarios"
        description="Organizá la apertura semanal y los cierres excepcionales."
      />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <HoursEditor hours={hours} />
        <ClosuresManager closures={closures} courts={courts} />
      </div>
    </div>
  );
}
