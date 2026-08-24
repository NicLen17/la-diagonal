import type { Metadata } from "next";
import { LookupForm } from "@/components/booking/lookup-form";
import { DiagonalSection, SectionHeading } from "@/components/layout/diagonal-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDataAccess } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mis reservas",
  description: "Consultá el estado de tu reserva con código y teléfono.",
};

export default async function MisReservasPage() {
  const venue = await getDataAccess().venues.getDefaultVenue();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <DiagonalSection tone="muted" className="py-10 sm:py-14">
          <div className="mx-auto max-w-lg px-4 sm:px-6">
            <SectionHeading
              eyebrow="Consultas"
              title="Mis reservas"
              description="Ingresá el código de tu reserva y el teléfono con el que te registraste."
            />
            <LookupForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Próximamente: magic link por email
            </p>
          </div>
        </DiagonalSection>
      </main>
      <SiteFooter
        instagramUrl={venue.instagramUrl}
        facebookUrl={venue.facebookUrl}
        whatsappUrl={venue.whatsappContactUrl}
      />
    </>
  );
}
