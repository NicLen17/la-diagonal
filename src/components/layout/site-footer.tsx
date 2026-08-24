import Link from "next/link";
import Image from "next/image";
import {
  CalendarDaysIcon,
  GraduationCapIcon,
  LockIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  TrophyIcon,
  UtensilsIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function InstagramIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className + " fill-current"} aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

export function SiteFooter({
  instagramUrl,
  facebookUrl,
  whatsappUrl,
}: {
  instagramUrl?: string;
  facebookUrl: string;
  whatsappUrl: string;
}) {
  const igUrl = instagramUrl || "https://instagram.com/ladiagonalcomplejo";
  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/diagonal logo.jpg"
              alt="La Diagonal"
              width={40}
              height={40}
              className="rounded-xl border border-white/15"
            />
            <div>
              <span className="font-display text-xl uppercase tracking-wide">La Diagonal</span>
              <p className="text-xs text-lime-400 font-semibold">Complejo Deportivo & Bar</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Complejo deportivo en Tafí Viejo, Tucumán. Canchas sintéticas de fútbol, pádel, futsal y handball. Escuelita infantil y cantina deportiva.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex flex-col gap-2 text-xs">
          <p className="font-display uppercase tracking-wider text-sm text-lime-400 mb-1">Secciones</p>
          <Link href="/#deportes" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <TrophyIcon className="size-3.5 text-lime-400/80" />
            <span>Alquiler de Canchas</span>
          </Link>
          <Link href="/#escuelita" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <GraduationCapIcon className="size-3.5 text-lime-400/80" />
            <span>Escuelita de Fútbol Infantil</span>
          </Link>
          <Link href="/#bar" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <UtensilsIcon className="size-3.5 text-lime-400/80" />
            <span>Bar & Tercer Tiempo</span>
          </Link>
          <Link href="/reservar" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <CalendarDaysIcon className="size-3.5 text-lime-400/80" />
            <span>Reservar Online</span>
          </Link>
          <Link href="/mis-reservas" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <span>Consultar Mis Reservas</span>
          </Link>
        </div>

        {/* Column 3: Contact & Info */}
        <div className="flex flex-col gap-2 text-xs">
          <p className="font-display uppercase tracking-wider text-sm text-lime-400 mb-1">Contacto & Redes</p>
          <p className="text-slate-300 flex items-center gap-1.5">
            <MapPinIcon className="size-3.5 text-lime-400 shrink-0" />
            <span>Cabo Oscar Quipildor, Tafí Viejo</span>
          </p>
          <a href="tel:+543816643122" className="text-slate-300 transition hover:text-lime-400 flex items-center gap-1.5">
            <PhoneIcon className="size-3.5 text-lime-400 shrink-0" />
            <span>381 6 643122</span>
          </a>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href={igUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Complejo"
              className="rounded-lg bg-white/10 p-2 text-slate-300 transition hover:bg-rose-500 hover:text-white"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook Complejo"
              className="rounded-lg bg-white/10 p-2 text-slate-300 transition hover:bg-blue-600 hover:text-white"
            >
              <FacebookIcon />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="rounded-lg bg-lime-400/20 p-2 text-lime-400 transition hover:bg-lime-400 hover:text-navy-950"
            >
              <MessageCircleIcon className="size-4" />
            </a>
          </div>
        </div>

        {/* Column 4: Reserve Now CTA */}
        <div className="flex flex-col gap-3">
          <p className="font-display uppercase tracking-wider text-sm text-lime-400">Reservá tu Turno</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Elegí deporte, fecha y hora en tiempo real. Confirmación inmediata vía WhatsApp.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="h-10 bg-lime-400 text-xs font-bold text-navy-950 hover:bg-lime-300 w-full">
              <Link href="/reservar">Reservar Cancha Online</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 border-white/20 bg-white/5 text-xs text-white hover:bg-white/10 w-full">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                Escribir por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Complejo Deportivo La Diagonal. Todos los derechos reservados.</p>
          <Link href="/admin/login" className="flex items-center gap-1 text-slate-400 transition hover:text-slate-200">
            <LockIcon className="size-3" />
            <span>Acceso Administración</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
