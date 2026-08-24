import { getDataAccess } from "@/lib/data";
import { VenueConfigForm } from "@/components/admin/venue-config-form";

export default async function AdminConfiguracionPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl uppercase">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Datos bancarios, contacto y parámetros del complejo
        </p>
      </div>
      <VenueConfigForm venue={venue} />
    </div>
  );
}
