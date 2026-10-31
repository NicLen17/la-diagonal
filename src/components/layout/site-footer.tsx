import Link from "next/link";
import { BrandMark } from "./brand-mark";
import { BRAND } from "@/lib/brand";

export function SiteFooter({
  marketing = false,
}: {
  marketing?: boolean;
  instagramUrl?: string;
  facebookUrl?: string;
  whatsappUrl?: string;
}) {
  return (
    <footer className="cm-footer">
      <div className="cm-container flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="cm-brand">
            <BrandMark />
            <span translate="no">Cancha Manager</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-white/65">
            Tu web, tus reservas y tu operación. En el mismo equipo.
          </p>
        </div>
        <nav
          aria-label="Pie de página"
          className="flex flex-wrap gap-6 text-sm"
        >
          <Link href="/demo">Complejo de demo</Link>
          <Link href="/mis-reservas">Consultar reserva</Link>
          <Link href="/admin">Administración</Link>
          <a href={BRAND.contact} target="_blank" rel="noreferrer">
            Contacto
          </a>
        </nav>
      </div>
      <div className="cm-container flex flex-col justify-between gap-2 border-t border-white/15 py-5 text-xs text-white/60 sm:flex-row">
        <p>© {new Date().getFullYear()} Cancha Manager</p>
        <p>
          {marketing
            ? "Hecho para quienes hacen jugar."
            : "Entorno de demostración. No realices pagos reales."}
        </p>
      </div>
    </footer>
  );
}
