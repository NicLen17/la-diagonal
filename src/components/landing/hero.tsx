import Image from "next/image";
import Link from "next/link";
import {
  CalendarDaysIcon,
  FlameIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  StarIcon,
  ZapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/lib/data/types";

const QUICK_SPORTS = [
  { label: "Fútbol 5", slug: "futbol_5" },
  { label: "Fútbol 7", slug: "futbol_7" },
  { label: "Fútbol 9/11", slug: "futbol_9" },
  { label: "Pádel", slug: "padel" },
  { label: "Futsal", slug: "futsal" },
];

export function Hero({ venue }: { venue: Venue }) {
  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden bg-navy-950 text-white clip-diagonal-bottom">
      {/* Background Image with Dynamic Stadium Atmosphere */}
      <Image
        src="/images/Diagonal img 1.png"
        alt="Complejo Deportivo La Diagonal Tafí Viejo"
        fill
        priority
        className="object-cover object-center brightness-75 scale-105 transition-transform duration-1000"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/80 to-navy-950/70"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(155,228,20,0.12),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:py-24">
        {/* Badges row */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <Badge
            variant="secondary"
            className="gap-1.5 border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur sm:text-sm"
          >
            <StarIcon className="size-4 fill-gold-400 text-gold-400" />
            <span className="font-bold text-white">4.4</span>
            <span className="text-white/80">(+730 opiniones en Google)</span>
          </Badge>

          <Badge
            variant="secondary"
            className="hidden items-center gap-1.5 border-lime-400/30 bg-lime-400/10 px-3 py-1.5 text-xs font-medium text-lime-300 backdrop-blur sm:inline-flex"
          >
            <MapPinIcon className="size-3.5" />
            <span>Tafí Viejo, Tucumán</span>
          </Badge>

          <Badge
            variant="secondary"
            className="inline-flex items-center gap-1.5 border-bar-crimson/30 bg-bar-crimson/15 px-3 py-1.5 text-xs font-semibold text-rose-300 backdrop-blur"
          >
            <FlameIcon className="size-3.5 text-bar-crimson" />
            <span>Fútbol • Escuelita • Bar</span>
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl font-display text-4xl leading-[1.05] tracking-tight uppercase sm:text-6xl md:text-7xl lg:text-8xl">
          El complejo deportivo <br />
          <span className="text-lime-400 drop-shadow-[0_0_24px_rgba(155,228,20,0.4)]">
            de Tafí Viejo
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg md:text-xl">
          Canchas sintéticas de <strong className="text-white">Fútbol 5, 7, 9 y 11</strong>, futsal, handball y pádel. 
          Escuelita formativa infantil y el mejor <strong className="text-white">3er Tiempo en nuestro Bar</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="h-13 bg-lime-400 px-8 text-base font-bold text-navy-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/reservar" className="flex items-center gap-2">
              <CalendarDaysIcon className="size-5" />
              <span>Reservar Cancha Online</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-13 border-white/20 bg-white/10 px-6 text-base font-medium text-white backdrop-blur transition-all hover:bg-white/20 active:scale-[0.98]"
          >
            <a
              href={venue.whatsappContactUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <MessageCircleIcon className="size-5 text-lime-400" />
              <span>WhatsApp Directo</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-13 border-white/15 bg-transparent px-5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <a href="tel:+543816643122" className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-slate-400" />
              <span>381 6 643122</span>
            </a>
          </Button>
        </div>

        {/* Quick Sports Selector Strip */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-navy-900/80 p-3.5 backdrop-blur-md sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-lime-400">
              <ZapIcon className="size-4" />
              <span>Elegí tu deporte y reservá en segundos:</span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {QUICK_SPORTS.map((sport) => (
                <Link
                  key={sport.slug}
                  href={`/reservar?deporte=${sport.slug}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:border-lime-400 hover:bg-lime-400 hover:text-navy-950 active:scale-95"
                >
                  {sport.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
