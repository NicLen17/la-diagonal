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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Horarios</h1>
        <p className="text-sm text-muted-foreground">
          Horario de apertura y cierres excepcionales
        </p>
      </div>
      <HoursEditor hours={hours} />
      <ClosuresManager closures={closures} courts={courts} />
    </div>
  );
}
