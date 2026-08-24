import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2Icon,
  MessageCircleIcon,
} from "lucide-react";
import { ReservationCodeBlock } from "@/components/booking/reservation-code-block";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyField } from "@/components/ui/copy-button";
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
    title: `Voucher de Reserva ${code} | La Diagonal`,
  };
}

export default async function ReservaDetailPage({
  params,
}: PageProps<"/reserva/[code]">) {
  const { code } = await params;

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
  const needsTransfer =
    reservation.paymentMethod === "deposit" ||
    reservation.paymentMethod === "transfer_full";

  const isConfirmed = reservation.status === "confirmed";

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col text-white">
      <SiteHeader />

      <main className="flex-1 py-10 sm:py-16">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          {/* Ticket Card Container */}
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-navy-900 shadow-2xl backdrop-blur-md">
            {/* Header Ticket Section */}
            <div className="border-b border-white/10 bg-navy-950 p-6 sm:p-8 text-center relative">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-lime-400/15 text-lime-400 mb-3 drop-shadow-[0_0_15px_rgba(155,228,20,0.3)]">
                <CheckCircle2Icon className="size-8" />
              </div>

              <Badge
                className={
                  isConfirmed
                    ? "bg-lime-400 text-navy-950 font-bold px-3 py-1 text-xs"
                    : "bg-amber-400/20 text-amber-300 border-amber-400/30 px-3 py-1 text-xs"
                }
              >
                {STATUS_LABELS[reservation.status]}
              </Badge>

              <h1 className="mt-3 font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
                ¡Turno Registrado!
              </h1>
              <p className="mt-1 text-xs text-slate-300">
                Presentá este voucher digital o tu código al llegar al complejo.
              </p>
            </div>

            {/* Code Block Component */}
            <div className="p-6 sm:p-8 space-y-6">
              <ReservationCodeBlock code={reservation.code} />

              {/* Match Details List */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Cancha:</span>
                  <span className="font-bold text-white uppercase">{reservation.court.name}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Deporte:</span>
                  <span className="font-semibold text-lime-400">{SPORT_LABELS[reservation.court.sport]}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Fecha:</span>
                  <span className="font-semibold text-white capitalize">{dateLabel}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Horario:</span>
                  <span className="font-bold text-white">
                    {formatTimeLabel(reservation.startsAt)} – {formatTimeLabel(reservation.endsAt)} hs
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Total Turno:</span>
                  <span className="font-bold text-white">{formatArs(reservation.priceArs)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-slate-400">Modalidad de Pago:</span>
                  <span className="font-semibold text-slate-200">{PAYMENT_LABELS[reservation.paymentMethod]}</span>
                </div>

                {reservation.depositArs > 0 ? (
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-lime-400">
                    <span>Seña Abonada:</span>
                    <span className="font-bold">{formatArs(reservation.depositArs)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Titular de la Reserva:</span>
                  <span className="font-semibold text-white">{reservation.customer.fullName} ({reservation.customer.phoneE164})</span>
                </div>
              </div>

              {/* Bank Details for Transfer Verification */}
              {needsTransfer ? (
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-lime-400">
                    Datos Bancarios del Complejo
                  </p>
                  <div className="grid gap-2 text-xs">
                    <CopyField label="Titular" value={venue.bankHolder} />
                    <CopyField label="Alias" value={venue.bankAlias} />
                    <CopyField label="CBU" value={venue.bankCbu} />
                  </div>
                </div>
              ) : null}

              {/* WhatsApp Action Callout */}
              <div className="rounded-2xl border border-lime-400/40 bg-lime-400/10 p-5 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-lime-400 font-bold text-sm">
                  <MessageCircleIcon className="size-5" />
                  <span>Enviá tu comprobante por WhatsApp</span>
                </div>
                <p className="text-xs text-slate-300">
                  Tocá el botón abajo para abrir WhatsApp con los datos ya cargados y confirmar con la administración.
                </p>
                <Button asChild size="lg" className="w-full bg-lime-400 font-bold text-navy-950 hover:bg-lime-300 h-12 shadow-lg shadow-lime-400/20">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                    <MessageCircleIcon className="size-5" />
                    <span>Notificar por WhatsApp</span>
                  </a>
                </Button>
              </div>

              {/* Secondary Navigation Buttons */}
              <div className="grid gap-2.5 sm:grid-cols-2 pt-2">
                <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 h-11 text-xs font-semibold">
                  <Link href="/reservar">
                    Reservar otra cancha
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 h-11 text-xs font-semibold">
                  <Link href="/mis-reservas">
                    Ver mis reservas
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter
        instagramUrl={venue.instagramUrl}
        facebookUrl={venue.facebookUrl}
        whatsappUrl={venue.whatsappContactUrl}
      />
    </div>
  );
}