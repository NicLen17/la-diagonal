import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

export function SiteFooter({
  instagramUrl,
  facebookUrl,
  whatsappUrl,
}: {
  instagramUrl: string;
  facebookUrl: string;
  whatsappUrl: string;
}) {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/images/diagonal logo.jpg"
              alt=""
              width={36}
              height={36}
              className="rounded-md"
            />
            <span className="font-display text-xl uppercase">La Diagonal</span>
          </div>
          <p className="text-sm text-white/70">
            Complejo deportivo en Tafí Viejo. Desde 2017 impulsando el deporte
            recreativo y competitivo.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-lime-400">Contacto</p>
          <p>Cabo Oscar Quipildor, Tafí Viejo, Tucumán</p>
          <a href="tel:+543816643122" className="hover:text-lime-400">
            0381 664-3122
          </a>
          <div className="mt-2 flex gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-lime-400"
            >
              <InstagramIcon />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-lime-400"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-lime-400">Reservá ahora</p>
          <p className="text-sm text-white/70">
            Elegí cancha, horario y confirmá por WhatsApp en minutos.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/reservar">Ir a reservar</Link>
            </Button>
            <Button asChild variant="secondary">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Complejo Deportivo La Diagonal
      </div>
    </footer>
  );
}
