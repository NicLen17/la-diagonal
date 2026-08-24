import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MotionProvider } from "@/components/motion/motion-provider";
import { getDataAccess } from "@/lib/data";

export default async function MarketingLayout({
  children,
}: LayoutProps<"/">) {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();

  return (
    <MotionProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter
        instagramUrl={venue.instagramUrl}
        facebookUrl={venue.facebookUrl}
        whatsappUrl={venue.whatsappContactUrl}
      />
    </MotionProvider>
  );
}
