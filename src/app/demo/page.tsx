import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon, MapIcon, CheckIcon } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PlanMap } from "@/components/map/plan-map";
import { getDataAccess } from "@/lib/data";
import { SPORT_LABELS } from "@/lib/data/types";
import { formatArs } from "@/lib/services/pricing";
export const metadata = {
  title: "Complejo de demostración",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function DemoPage() {
  const db = getDataAccess();
  const venue = await db.venues.getDefaultVenue();
  const courts = (await db.courts.listByVenue(venue.id)).filter(
    (c) => c.isActive,
  );
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="cm-demo-page flex-1">
        <div className="cm-demo-banner">
          ESTÁS EN UNA DEMO · Complejo ficticio · No realices pagos reales
        </div>
        <section className="cm-container cm-section grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="cm-eyebrow">COMPLEJO CANCHA MANAGER</p>
            <h1 className="cm-demo-title">
              El próximo
              <br />
              partido arranca
              <br />
              <span>acá.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[#526359]">
              Fútbol, pádel y un lugar para encontrarse. Elegí tu cancha,
              encontrá un horario y dejá tu reserva sin crear una cuenta.
            </p>
            <Link
              className="cm-button cm-button-dark cm-button-lg mt-7"
              href="/reservar"
            >
              Encontrar mi turno
              <ArrowUpRightIcon aria-hidden="true" className="size-5" />
            </Link>
            <p className="mt-5 flex items-center gap-2 text-sm">
              <ClockIcon aria-hidden="true" className="size-4" />
              Todos los días de 09:00 a 00:00
            </p>
          </div>
          <div className="rounded-3xl bg-[#dfe9da] p-4 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="cm-eyebrow">CONOCÉ NUESTRAS CANCHAS</span>
              <MapIcon aria-hidden="true" className="size-5" />
            </div>
            <PlanMap
              venue={venue}
              courts={courts.map((court) => ({ court }))}
            />
            <p className="mt-4 text-xs text-[#526359]">
              Plano ilustrativo del complejo de demostración.
            </p>
          </div>
        </section>
        <section className="cm-container pb-20">
          <div className="cm-section-heading">
            <h2>Elegí dónde jugar.</h2>
            <p>
              Precios de ejemplo. El valor final depende del horario que elijas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <article key={court.id} className="cm-court-card">
                <span className="cm-eyebrow">{SPORT_LABELS[court.sport]}</span>
                <h3 className="my-3 text-2xl">{court.name}</h3>
                <p className="text-sm text-[#526359]">{court.description}</p>
                <div className="my-5 flex items-center gap-2 text-xs">
                  <CheckIcon aria-hidden="true" className="size-4" />
                  {court.hasLights ? "Con iluminación" : "Al aire libre"} ·{" "}
                  {court.slotDurationMinutes} minutos
                </div>
                <Link
                  className="cm-court-link"
                  href={`/reservar?deporte=${court.sport}&cancha=${court.id}`}
                >
                  <span>Desde {formatArs(court.basePriceArs)}</span>
                  <ArrowUpRightIcon aria-hidden="true" className="size-5" />
                  <span className="sr-only">Ver turnos de {court.name}</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
