import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataAccess } from "@/lib/data";
export const dynamic = "force-dynamic";

export default async function ReservarLayout({
  children,
}: LayoutProps<"/reservar">) {
  const venue = await getDataAccess().venues.getDefaultVenue();

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <div className="cm-demo-banner">
          DEMO · No realices pagos reales · Paso 1: elegí turno · Paso 2:
          completá tus datos
        </div>
        {children}
      </main>
      <SiteFooter
        instagramUrl={venue.instagramUrl}
        facebookUrl={venue.facebookUrl}
        whatsappUrl={venue.whatsappContactUrl}
      />
    </>
  );
}
