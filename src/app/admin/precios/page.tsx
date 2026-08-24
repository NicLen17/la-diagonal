import { getDataAccess } from "@/lib/data";
import { PriceRulesManager } from "@/components/admin/price-rules-manager";

export default async function AdminPreciosPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const [rules, courts, hours, closures] = await Promise.all([
    db.priceRules.listByVenue(venue.id),
    db.courts.listByVenue(venue.id),
    db.venues.listVenueHours(venue.id),
    db.closures.listByVenue(venue.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Precios</h1>
        <p className="text-sm text-muted-foreground">
          Reglas dinámicas y vista previa por fecha
        </p>
      </div>
      <PriceRulesManager
        rules={rules}
        courts={courts}
        hours={hours}
        closures={closures}
      />
    </div>
  );
}
