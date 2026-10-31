import Link from "next/link";
import { MenuIcon, ArrowUpRightIcon } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { BRAND } from "@/lib/brand";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function SiteHeader({ marketing = false }: { marketing?: boolean }) {
  const links = marketing
    ? [
        { href: "/#producto", label: "El producto" },
        { href: "/#como-funciona", label: "Cómo funciona" },
        { href: "/#preguntas", label: "Preguntas" },
      ]
    : [
        { href: "/demo", label: "El complejo" },
        { href: "/reservar", label: "Reservar cancha" },
        { href: "/mis-reservas", label: "Mi reserva" },
      ];
  return (
    <header className="cm-header">
      <a className="cm-skip" href="#contenido">
        Saltar al contenido
      </a>
      <div className="cm-header-inner">
        <Link
          href={marketing ? "/" : "/demo"}
          className="cm-brand"
          aria-label={
            marketing ? "Cancha Manager, inicio" : "Complejo de demo, inicio"
          }
        >
          <BrandMark />
          <span translate="no">
            Cancha<span className="font-normal">Manager</span>
            <small>
              {marketing ? "EL JUEGO, EN ORDEN." : "COMPLEJO DE DEMOSTRACIÓN"}
            </small>
          </span>
        </Link>
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm font-medium lg:flex"
        >
          {links.map((link) => (
            <Link className="cm-nav-link" key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={marketing ? "/demo" : "/"}
            className="hidden text-sm font-semibold hover:underline sm:block"
          >
            {marketing ? "Probar demo" : "Conocer el producto"}
          </Link>
          <a
            className="cm-button cm-button-dark hidden sm:inline-flex"
            href={marketing ? BRAND.contact : "/reservar"}
            {...(marketing ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {marketing ? "Solicitar demo" : "Elegir turno"}
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </a>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                className="lg:hidden"
                variant="outline"
                size="icon"
                aria-label="Abrir menú"
              >
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cancha Manager</SheetTitle>
                <SheetDescription>
                  {marketing
                    ? "Tu complejo, mejor conectado."
                    : "Estás recorriendo un complejo ficticio."}
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-5" aria-label="Menú móvil">
                {[
                  ...links,
                  {
                    href: marketing ? "/demo" : "/",
                    label: marketing ? "Probar demo" : "Conocer el producto",
                  },
                ].map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      className="rounded-lg px-3 py-3 hover:bg-muted"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <a
                  href={BRAND.contact}
                  target="_blank"
                  rel="noreferrer"
                  className="cm-button cm-button-dark mt-3"
                >
                  Solicitar demo
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
