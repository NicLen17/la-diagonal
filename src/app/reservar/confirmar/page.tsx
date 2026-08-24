import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmForm } from "@/components/booking/confirm-form";
import { DiagonalSection } from "@/components/layout/diagonal-section";
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
import { formatArs } from "@/lib/services/pricing";
import { SPORT_LABELS } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Confirmar reserva",
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
      <HoldError message="No encontramos esa reserva. Puede haber expirado." />
    );
  }

  if (reservation.status !== "hold") {
    return (
      <HoldError message="Esta reserva ya no está en proceso. Volvé a elegir un turno." />
    );
  }

  if (
    reservation.holdExpiresAt &&
    reservation.holdExpiresAt < new Date().toISOString()
  ) {
    return (
      <HoldError message="El tiempo para confirmar expiró. Elegí el turno nuevamente." />
    );
  }

  const { venue, court } = reservation;
  const dateLabel = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <DiagonalSection tone="muted" className="py-10 sm:py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Confirmá tu reserva</CardTitle>
            <CardDescription>
              Completá tus datos y elegí cómo vas a pagar. Tenés{" "}
              {venue.holdTtlMinutes} minutos para finalizar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{court.name}</p>
              <p className="text-muted-foreground">
                {SPORT_LABELS[court.sport]} · {dateLabel}
              </p>
              <p className="mt-1">
                {formatTimeLabel(reservation.startsAt)} –{" "}
                {formatTimeLabel(reservation.endsAt)} ·{" "}
                <span className="font-semibold">
                  {formatArs(reservation.priceArs)}
                </span>
              </p>
            </div>

            <ConfirmForm
              reservationId={reservation.id}
              holdExpiresAt={reservation.holdExpiresAt}
              holdTtlMinutes={venue.holdTtlMinutes}
              priceArs={reservation.priceArs}
              venue={venue}
            />
          </CardContent>
        </Card>
      </div>
    </DiagonalSection>
  );
}

function HoldError({ message }: { message: string }) {
  return (
    <DiagonalSection tone="muted" className="py-10 sm:py-14">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Reserva no disponible</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/reservar">Volver a reservar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DiagonalSection>
  );
}
