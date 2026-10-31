import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getDataAccess } from "@/lib/data";
import { VenueConfigForm } from "@/components/admin/venue-config-form";
import { DemoControls } from "@/components/admin/demo-controls";

export default async function AdminConfiguracionPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Configuración"
        description="Datos de cobro, contacto y preferencias del complejo."
      />
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <VenueConfigForm venue={venue} />
        <DemoControls />
      </div>
    </div>
  );
}
