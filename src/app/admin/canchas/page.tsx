import { getDataAccess } from "@/lib/data";
import { CourtsTable } from "@/components/admin/courts-table";

export default async function AdminCanchasPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const courts = await db.courts.listByVenue(venue.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Canchas</h1>
        <p className="text-sm text-muted-foreground">
          Alta, edición y baja de canchas del complejo
        </p>
      </div>
      <CourtsTable courts={courts} />
    </div>
  );
}
