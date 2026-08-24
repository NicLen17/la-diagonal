import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircleIcon } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { DiagonalSection } from "@/components/layout/diagonal-section";
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
import {
  PAYMENT_LABELS,
  SPORT_LABELS,
  STATUS_LABELS,
} from "@/lib/data/types";
import { formatTimeLabel } from "@/lib/services/availability";
import { formatArs } from "@/lib/services/pricing";
import {
  buildReservationMessage,
  buildWhatsAppUrl,
} from "@/lib/services/whatsapp";

export async function generateMetadata({
  params,
}: PageProps<"/reserva/[code]">): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Reserva ${code}`,
  };
}

export default async function ReservaDetailPage({
  params,
  searchParams,
}: PageProps<"/reserva/[code]">) {
  const { code } = await params;
  const query = await searchParams;
  const showWaProminent = query.wa === "1";

  const db = getDataAccess();
  const [reservation, venue] = await Promise.all([
    db.reservations.getByCode(code),
    db.venues.getDefaultVenue(),
  ]);

  if (!reservation) notFound();

  const dateLabel = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const whatsappMessage = buildReservationMessage(reservation);
  const whatsappUrl = buildWhatsAppUrl(
    reservation.venue.whatsappE164,
    whatsappMessage,
  );

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <DiagonalSection tone="muted" className="flex-1 py-10 sm:py-14">
          <div className="mx-auto max-w-xl px-4 sm:px-6">
            <Card>
              <CardHeader className="text-center">
                <Badge className="mx-auto w-fit" variant="secondary">
                  {STATUS_LABELS[reservation.status]}
                </Badge>
                <CardTitle className="mt-3 text-2xl">
                  Reserva {reservation.code}
                </CardTitle>
                <CardDescription>
                  Guardá este código para consultar tu reserva.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <dl className="space-y-3 text-sm">
                  <Row label="Cancha" value={reservation.court.name} />
                  <Row
                    label="Deporte"
                    value={SPORT_LABELS[reservation.court.sport]}
                  />
                  <Row label="Fecha" value={dateLabel} />
                  <Row
                    label="Horario"
                    value={`${formatTimeLabel(reservation.startsAt)} – ${formatTimeLabel(reservation.endsAt)}`}
                  />
                  <Row label="Precio" value={formatArs(reservation.priceArs)} />
                  <Row
                    label="Pago"
                    value={PAYMENT_LABELS[reservation.paymentMethod]}
                  />
                  {reservation.depositArs > 0 ? (
                    <Row
                      label="Seña"
                      value={formatArs(reservation.depositArs)}
                    />
                  ) : null}
                  <Row label="Nombre" value={reservation.customer.fullName} />
                  <Row label="Teléfono" value={reservation.customer.phoneE164} />
                  <Row label="Email" value={reservation.customer.email} />
                </dl>

                {showWaProminent ? (
                  <div className="rounded-xl border-2 border-lime-400 bg-lime-400/10 p-4 text-center">
                    <p className="mb-3 text-sm font-medium">
                      Último paso: enviá los datos por WhatsApp para que
                      confirmemos tu turno.
                    </p>
                    <Button asChild size="lg" className="w-full">
                      <a href={whatsappUrl} target="_blank" rel="noreferrer">
                        <MessageCircleIcon data-icon="inline-start" />
                        Enviar por WhatsApp
                      </a>
                    </Button>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    asChild
                    variant={showWaProminent ? "outline" : "default"}
                    className="flex-1"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <MessageCircleIcon data-icon="inline-start" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="flex-1">
                    <Link href="/mis-reservas">Mis reservas</Link>
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  <Link
                    href="/reservar"
                    className="underline hover:text-foreground"
                  >
                    Hacer otra reserva
                  </Link>
                </p>
              </CardContent>
            </Card>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
