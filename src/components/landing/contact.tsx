import Image from "next/image";
import {
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneCallIcon,
  PhoneIcon,
  Share2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";
import type { Venue } from "@/lib/data/types";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className + " fill-current"} aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Complejo+Deportivo+La+Diagonal+Cabo+Oscar+Quipildor+Taf%C3%AD+Viejo";

export function Contact({ venue }: { venue: Venue }) {
  const fullAddress = `${venue.address}, ${venue.city}, ${venue.province}`;

  return (
    <DiagonalSection
      id="contacto"
      tone="navy"
      clip="top"
      className="px-4 py-20 sm:px-6 text-white bg-navy-950"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Ubicación y Contacto"
          title="Vení a Jugar a La Diagonal"
          description="Estamos en Tafí Viejo, Tucumán. Fácil acceso, estacionamiento privado y la mejor atención."
          light
        />

        {/* Official Signboard Banner */}
        <div className="mt-8 mb-12 overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-md">
          <div className="relative aspect-[21/6] w-full overflow-hidden rounded-xl bg-white sm:aspect-[24/6]">
            <Image
              src="/images/cartel-contacto.png"
              alt="Cartel oficial La Diagonal Complejo Deportivo - Reservá al 381 6 643122"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <MapPinIcon className="mt-1 size-6 shrink-0 text-lime-400" />
              <div>
                <p className="font-display uppercase tracking-wide text-white">Dirección</p>
                <p className="mt-1 text-sm text-slate-300">{fullAddress}</p>
                <p className="text-xs text-lime-400 mt-1">Cabo Oscar Quipildor • Tafí Viejo, Tucumán</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <PhoneCallIcon className="mt-1 size-6 shrink-0 text-lime-400" />
              <div>
                <p className="font-display uppercase tracking-wide text-white">Teléfono & Reservas</p>
                <a
                  href="tel:+543816643122"
                  className="mt-1 block text-lg font-bold text-white transition hover:text-lime-400"
                >
                  381 6 643122
                </a>
                <p className="text-xs text-slate-400">Atención telefónica y WhatsApp de 09:00 a 00:00 hs</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <ClockIcon className="mt-1 size-6 shrink-0 text-lime-400" />
              <div>
                <p className="font-display uppercase tracking-wide text-white">Horarios de Canchas & Bar</p>
                <p className="mt-1 text-sm text-slate-300">Lunes a Domingos de 09:00 a 00:00 hs</p>
                <p className="text-xs text-slate-400">Turnos nocturnos con iluminación LED profesional</p>
              </div>
            </div>

            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <Share2Icon className="mt-1 size-6 shrink-0 text-lime-400" />
              <div>
                <p className="font-display uppercase tracking-wide text-white">Redes Sociales Oficiales</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  <a
                    href="https://instagram.com/ladiagonalcomplejo"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 hover:text-white"
                  >
                    <InstagramIcon className="size-4" />
                    <span>@ladiagonalcomplejo</span>
                  </a>

                  <a
                    href="https://instagram.com/ladiagonal.reddecomplejos"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 hover:text-white"
                  >
                    <InstagramIcon className="size-4" />
                    <span>@ladiagonal.reddecomplejos</span>
                  </a>

                  <a
                    href={venue.whatsappContactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-navy-950 transition hover:bg-lime-300"
                  >
                    <MessageCircleIcon className="size-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-navy-900/70 p-6 sm:p-8 backdrop-blur">
            <div>
              <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs font-bold uppercase mb-3">
                Cómo Llegar
              </Badge>
              <h3 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
                Ubicación Estratégica en Tafí Viejo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                A pocos minutos del centro de Tafí Viejo y con conexión rápida hacia San Miguel de Tucumán. Contamos con acceso pavimentado, seguridad y estacionamiento interno para autos y motos.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild size="lg" className="w-full bg-lime-400 h-12 font-bold text-navy-950 hover:bg-lime-300">
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2">
                  <MapPinIcon className="size-5" />
                  <span>Abrir en Google Maps y Navegar</span>
                  <ExternalLinkIcon className="size-4 ml-1 opacity-70" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full border-white/20 bg-white/5 h-12 text-white hover:bg-white/10">
                <a href="tel:+543816643122" className="flex items-center justify-center gap-2">
                  <PhoneIcon className="size-5 text-lime-400" />
                  <span>Llamar al 381 6 643122</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DiagonalSection>
  );
}
