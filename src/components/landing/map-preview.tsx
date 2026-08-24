import Link from "next/link";
import { PlanMap } from "@/components/map/plan-map";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";
import { Button } from "@/components/ui/button";
import type { Court, Venue } from "@/lib/data/types";

export function MapPreview({
  venue,
  courts,
}: {
  venue: Venue;
  courts: Court[];
}) {
  const planCourts = courts.map((court) => ({ court }));

  return (
    <DiagonalSection tone="light" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Plano interactivo"
          title="Conocé el predio"
          description="Vista aérea de todas nuestras canchas. En la reserva podés ver disponibilidad en tiempo real."
        />

        <div className="grid items-center gap-8 lg:grid-cols-2">
          <PlanMap venue={venue} courts={planCourts} mode="preview" />

          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              El complejo cuenta con {courts.length} canchas activas: fútbol 5,
              fútbol 7, fútbol 9, fútbol 11, pádel y un espacio multipropósito
              para handball y futsal.
            </p>
            <ul className="space-y-2 text-sm text-navy-800">
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-lime-400" aria-hidden />
                Césped sintético y natural según la cancha
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-lime-400" aria-hidden />
                Iluminación para turnos nocturnos
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-lime-400" aria-hidden />
                Estacionamiento en el predio
              </li>
            </ul>
            <Button asChild size="lg" className="mt-2 w-fit">
              <Link href="/reservar">Ver disponibilidad</Link>
            </Button>
          </div>
        </div>
      </div>
    </DiagonalSection>
  );
}
