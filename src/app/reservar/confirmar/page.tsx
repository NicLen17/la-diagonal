import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ClockIcon,
  SparklesIcon,
} from "lucide-react";
import { ConfirmForm } from "@/components/booking/confirm-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDataAccess } from "@/lib/data";
import { formatTimeLabel } from "@/lib/services/availability";
import { SPORT_LABELS } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Confirmar Reserva",
};

export default async function ConfirmarPage({
  searchParams,
}: PageProps<"/reservar/confirmar">) {
  const params = await searchParams;
  const holdId = typeof params.hold === "string" ? params.hold : undefined;

  if (!holdId) {
    return <HoldError message="Falta el identificador de la reserva temporal." />;
  }

  const reservation = await getDataAccess().reservations.getById(holdId);

  if (!reservation) {
    return (
      <HoldError message="No encontramos esa reserva. Puede haber expirado o cancelado." />
    );
  }

  if (reservation.status !== "hold") {
    return (
      <HoldError message="Esta reserva ya no está en proceso de confirmación. Elegí un nuevo turno." />
    );
  }

  if (
    reservation.holdExpiresAt &&
    reservation.holdExpiresAt < new Date().toISOString()
  ) {
    return (
      <HoldError message="El tiempo límite de 15 minutos para confirmar expiró. Por favor seleccioná el turno nuevamente." />
    );
  }

  const { venue, court } = reservation;
  const dateLabel = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-navy-950 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Back navigation */}
        <Link
          href="/reservar"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-lime-400"
        >
          <ChevronLeftIcon className="size-4" />
          <span>Volver a la selección de turnos</span>
        </Link>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-navy-900/90 shadow-2xl backdrop-blur-md">
          {/* Header Ticket Section */}
          <div className="border-b border-white/10 p-6 sm:p-8 bg-navy-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                  <SparklesIcon className="size-4" />
                  <span>Paso 2 de 2: Datos del Jugador y Pago</span>
                </div>
                <h1 className="mt-1 font-display text-2xl uppercase tracking-wide sm:text-3xl text-white">
                  Confirmá tu Turno
                </h1>
                <p className="mt-1 text-xs text-slate-300">
                  Tu turno está bloqueado durante {venue.holdTtlMinutes} minutos para que puedas completar los datos.
                </p>
              </div>

              {/* Match summary ticket pill */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-left sm:text-right">
                <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-[10px] uppercase font-bold mb-1">
                  {SPORT_LABELS[court.sport]}
                </Badge>
                <p className="font-display text-lg uppercase tracking-wide text-white">
                  {court.name}
                </p>
                <p className="text-xs text-slate-300 capitalize">
                  {dateLabel}
                </p>
                <p className="mt-1 text-sm font-bold text-lime-400">
                  {formatTimeLabel(reservation.startsAt)} – {formatTimeLabel(reservation.endsAt)} hs
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <ConfirmForm
              reservationId={reservation.id}
              holdExpiresAt={reservation.holdExpiresAt}
              holdTtlMinutes={venue.holdTtlMinutes}
              priceArs={reservation.priceArs}
              venue={venue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HoldError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12 text-white">
      <Card className="max-w-md border-white/15 bg-navy-900 text-white text-center p-6">
        <CardHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400 mb-2">
            <ClockIcon className="size-6" />
          </div>
          <CardTitle className="font-display text-2xl uppercase text-white">
            Turno no disponible
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <Button asChild className="w-full bg-lime-400 font-bold text-navy-950 hover:bg-lime-300 h-11">
            <Link href="/reservar">
              Volver a buscar canchas
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
