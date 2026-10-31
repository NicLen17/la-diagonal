import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader marketing />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter marketing />
    </>
  );
}
