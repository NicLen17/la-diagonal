import { venueDateKey } from "@/lib/services/venue-time";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
    <div className="admin-page">
      <AdminPageHeader
        title="Precios"
        description="Definí tarifas y comprobá cuánto cuesta cada turno."
      />
      <PriceRulesManager
        initialDate={venueDateKey(new Date())}
        rules={rules}
        courts={courts}
        hours={hours}
        closures={closures}
      />
    </div>
  );
}
