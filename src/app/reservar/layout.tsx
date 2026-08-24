import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataAccess } from "@/lib/data";

export default async function ReservarLayout({
  children,
}: LayoutProps<"/reservar">) {
  const venue = await getDataAccess().venues.getDefaultVenue();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter
        instagramUrl={venue.instagramUrl}
        facebookUrl={venue.facebookUrl}
        whatsappUrl={venue.whatsappContactUrl}
      />
    </>
  );
}
