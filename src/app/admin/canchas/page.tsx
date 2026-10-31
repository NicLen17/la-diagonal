import Link from "next/link";
import { getDataAccess } from "@/lib/data";
import { CourtsTable } from "@/components/admin/courts-table";
import { MapBuilder } from "@/components/admin/map-builder";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminCanchasPage({
  searchParams,
}: PageProps<"/admin/canchas">) {
  const params = await searchParams;
  const isMap = params.vista === "mapa";
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const courts = await db.courts.listByVenue(venue.id);
  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Canchas y predio"
        description="Administrá tus canchas, precios base y distribución desde un mismo lugar."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Vistas de canchas" className="admin-nav-tabs">
          <Link
            href="/admin/canchas"
            aria-current={!isMap ? "page" : undefined}
          >
            Listado
          </Link>
          <Link
            href="/admin/canchas?vista=mapa"
            aria-current={isMap ? "page" : undefined}
          >
            Plano del predio
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          {courts.filter((c) => c.isActive).length} activas · {courts.length} en
          total
        </p>
      </div>
      {isMap ? (
        <MapBuilder venue={venue} courts={courts} />
      ) : (
        <CourtsTable courts={courts} />
      )}
    </div>
  );
}
