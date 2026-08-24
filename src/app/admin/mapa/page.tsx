import { getDataAccess } from "@/lib/data";
import { MapBuilder } from "@/components/admin/map-builder";

export default async function AdminMapaPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const courts = await db.courts.listByVenue(venue.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Mapa del predio</h1>
        <p className="text-sm text-muted-foreground">
          Armá el plano arrastrando y redimensionando canchas en metros
        </p>
      </div>
      <MapBuilder venue={venue} courts={courts} />
    </div>
  );
}
