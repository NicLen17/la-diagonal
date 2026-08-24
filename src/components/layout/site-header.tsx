import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MenuIcon, PhoneIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/#deportes", label: "Deportes" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/reservar", label: "Reservar" },
  { href: "/mis-reservas", label: "Mis reservas" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/diagonal logo.jpg"
            alt="La Diagonal"
            width={40}
            height={40}
            className="rounded-md"
            priority
          />
          <span className="font-display text-lg tracking-wide uppercase">
            La Diagonal
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/80 transition hover:text-lime-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="secondary" size="sm">
            <a href="tel:+543816643122">
              <PhoneIcon data-icon="inline-start" />
              Llamar
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/reservar">Reservar cancha</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="md:hidden"
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-navy-900 text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Menú</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-lg hover:text-lime-400"
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-4">
                <Link href="/reservar">Reservar cancha</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
