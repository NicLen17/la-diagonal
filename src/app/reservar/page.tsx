import type { Metadata } from "next";
import { BookingBoard } from "@/components/booking/booking-board";
import { DiagonalSection } from "@/components/layout/diagonal-section";
import {
  findNextAvailableHour,
  parseSportParam,
  parseViewParam,
} from "@/lib/services/booking-helpers";
import { getAvailabilityForDate } from "@/lib/services/reservations";
import { parseDateInput, toDateInputValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reservar",
  description: "Elegí fecha, deporte y horario para reservar tu cancha en La Diagonal.",
};

export default async function ReservarPage({
  searchParams,
}: PageProps<"/reservar">) {
  const params = await searchParams;
  const fecha =
    typeof params.fecha === "string" && params.fecha
      ? params.fecha
      : toDateInputValue(new Date());
  const deporte = parseSportParam(
    typeof params.deporte === "string" ? params.deporte : undefined,
  );
  const vista = parseViewParam(
    typeof params.vista === "string" ? params.vista : undefined,
  );
  const cancha =
    typeof params.cancha === "string" && params.cancha ? params.cancha : undefined;

  const date = parseDateInput(fecha);
  const availability = await getAvailabilityForDate(date.toISOString());

  let hora =
    typeof params.hora === "string" && params.hora ? params.hora : undefined;
  if (!hora) {
    hora = findNextAvailableHour(availability.slotsByCourt, date) ?? undefined;
  }

  return (
    <DiagonalSection tone="muted" className="py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <BookingBoard
          venue={availability.venue}
          courts={availability.courts}
          slotsByCourt={availability.slotsByCourt}
          initialFecha={fecha}
          initialDeporte={deporte}
          initialHora={hora}
          initialCancha={cancha}
          initialVista={vista}
        />
      </div>
    </DiagonalSection>
  );
}
