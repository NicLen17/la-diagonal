import {
  ClockIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";
import type { Venue } from "@/lib/data/types";

function formatPhoneDisplay(phoneE164: string): string {
  const local = phoneE164.replace(/^54/, "0");
  if (local.length >= 10) {
    return `${local.slice(0, 4)} ${local.slice(4, 7)}-${local.slice(7)}`;
  }
  return phoneE164;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Complejo+Deportivo+La+Diagonal+Cabo+Oscar+Quipildor+Taf%C3%AD+Viejo";

export function Contact({ venue }: { venue: Venue }) {
  const phoneDisplay = formatPhoneDisplay(venue.phoneE164);
  const fullAddress = `${venue.address}, ${venue.city}, ${venue.province}`;

  return (
    <DiagonalSection
      id="contacto"
      tone="navy"
      clip="top"
      className="px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Contacto"
          title="Visitános"
          description="Estamos en Tafí Viejo, a minutos de San Miguel de Tucumán."
          light
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-lime-400" />
              <div>
                <p className="font-semibold text-white">Dirección</p>
                <p className="text-white/75">{fullAddress}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <PhoneIcon className="mt-0.5 size-5 shrink-0 text-lime-400" />
              <div>
                <p className="font-semibold text-white">Teléfono</p>
                <a
                  href={`tel:+${venue.phoneE164.replace(/\D/g, "")}`}
                  className="text-white/75 transition hover:text-lime-400"
                >
                  {phoneDisplay}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <ClockIcon className="mt-0.5 size-5 shrink-0 text-lime-400" />
              <div>
                <p className="font-semibold text-white">Horarios</p>
                <p className="text-white/75">Todos los días de 09:00 a 00:00</p>
              </div>
            </div>

            <div className="flex gap-4">
              <MailIcon className="mt-0.5 size-5 shrink-0 text-lime-400" />
              <div>
                <p className="font-semibold text-white">Redes</p>
                <div className="mt-2 flex gap-3">
                  <a
                    href={venue.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20 hover:text-lime-400"
                  >
                    <InstagramIcon />
                  </a>
                  <a
                    href={venue.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20 hover:text-lime-400"
                  >
                    <FacebookIcon />
                  </a>
                  <a
                    href={venue.whatsappContactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-lime-400 px-3 py-2 text-sm font-medium text-navy-950 transition hover:bg-lime-300"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-white/80">
              El mapa interactivo de Google se carga bajo demanda para mantener
              la página rápida. Abrilo cuando quieras ver la ubicación exacta o
              calcular tu ruta.
            </p>
            <Button asChild variant="secondary" size="lg" className="w-fit">
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                Abrir en Google Maps
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </DiagonalSection>
  );
}
