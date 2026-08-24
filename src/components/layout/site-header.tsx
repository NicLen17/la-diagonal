import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CalendarDaysIcon,
  GraduationCapIcon,
  MenuIcon,
  PhoneIcon,
  TrophyIcon,
  UtensilsIcon,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/#deportes", label: "Canchas", icon: TrophyIcon },
  { href: "/#escuelita", label: "Escuelita", icon: GraduationCapIcon },
  { href: "/#bar", label: "Bar & 3er Tiempo", icon: UtensilsIcon },
  { href: "/reservar", label: "Reservar Online", icon: CalendarDaysIcon },
  { href: "/mis-reservas", label: "Mis Reservas", icon: CalendarDaysIcon },
  { href: "/#contacto", label: "Contacto", icon: PhoneIcon },
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

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-lime-400"
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
          <SheetContent
            side="right"
            className="gap-0 border-l border-white/10 bg-navy-900 p-0 text-white"
          >
            <SheetHeader className="border-b border-white/10 px-6 py-5">
              <SheetTitle className="font-display text-lg tracking-wide text-white uppercase">
                Menú
              </SheetTitle>
              <SheetDescription className="text-white/60">
                Complejo Deportivo La Diagonal
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base text-white/90 transition-colors hover:bg-white/10 hover:text-lime-400 active:bg-white/15"
                    >
                      <Icon className="size-5 shrink-0 text-lime-400/80" />
                      <span>{link.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 border-t border-white/10 px-4 py-5">
              <SheetClose asChild>
                <Button asChild className="h-12 w-full text-base">
                  <Link href="/reservar">Reservar cancha</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  asChild
                  variant="secondary"
                  className="h-11 w-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  <a href="tel:+543816643122">
                    <PhoneIcon data-icon="inline-start" />
                    Llamar
                  </a>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
