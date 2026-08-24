import Image from "next/image";
import Link from "next/link";
import {
  BeerIcon,
  CalendarDaysIcon,
  FlameIcon,
  PartyPopperIcon,
  PizzaIcon,
  SparklesIcon,
  TvIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  {
    icon: BeerIcon,
    title: "Cerveza Tirada y Bebidas Frías",
    desc: "Cervezas heladas artesanales y tradicionales, gaseosas e isotónicas para refrescarse al terminar.",
  },
  {
    icon: PizzaIcon,
    title: "Hamburguesas, Lomitos y Picadas",
    desc: "Platos calientes y snacks al paso listos en minutos para compartir entre todos los compañeros de equipo.",
  },
  {
    icon: TvIcon,
    title: "Partidos en Pantalla Gigante",
    desc: "Viví la Champions, Copa Libertadores, Liga Profesional y clásicos con la mejor definición y sonido.",
  },
  {
    icon: PartyPopperIcon,
    title: "Cumpleaños y Festejos",
    desc: "Espacio reservable con catering y mesas exclusivas para celebrar cumpleaños deportivos o eventos de empresa.",
  },
];

export function BarSection() {
  return (
    <section id="bar" className="relative overflow-hidden bg-navy-900 py-20 text-white">
      {/* Background accents */}
      <div className="absolute right-0 top-1/3 size-96 rounded-full bg-bar-crimson/10 blur-3xl" aria-hidden />
      <div className="absolute left-1/4 bottom-0 size-80 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Top Badges & Heading */}
        <div className="text-center">
          <Badge
            variant="secondary"
            className="mb-3 gap-1.5 border-bar-crimson/40 bg-bar-crimson/20 px-3.5 py-1 text-xs font-semibold text-rose-300 backdrop-blur inline-flex"
          >
            <FlameIcon className="size-4 text-rose-400" />
            <span>El Tercer Tiempo</span>
          </Badge>

          <h2 className="font-display text-3xl tracking-wide uppercase sm:text-5xl md:text-6xl text-white">
            La Diagonal <span className="text-rose-400">Bar & Fútbol 7</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
            El partido no termina en el minuto 60. Sentate con tu equipo a disfrutar del mejor tercer tiempo con comida rica, cerveza helada y buena música.
          </p>
        </div>

        {/* Feature Hero Banner with Official Logo */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/15 bg-navy-950/80 shadow-2xl backdrop-blur-md">
          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-12">
            {/* Logo showcase */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-6 text-center border border-white/10 lg:col-span-5">
              <div className="relative size-44 sm:size-52 overflow-hidden rounded-2xl drop-shadow-[0_0_20px_rgba(217,56,41,0.3)]">
                <Image
                  src="/images/bar-logo.png"
                  alt="Logo La Diagonal Bar - Fútbol 7"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 180px, 220px"
                />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                <SparklesIcon className="size-3.5" />
                <span>Bar & Cantina Deportiva</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Abierto todos los días de 18:00 a 01:00 hs
              </p>
            </div>

            {/* Menu & Atmosphere Highlights */}
            <div className="lg:col-span-7">
              <h3 className="font-display text-2xl uppercase tracking-wide sm:text-3xl text-white">
                Todo lo que necesitás después de jugar
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Instalaciones cómodas con mesas al aire libre y techadas, vista a las canchas de Fútbol 7 y 5, y la mejor atención.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {MENU_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-bar-crimson/20 text-rose-400">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">{item.title}</h4>
                        <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-lime-400 font-bold text-navy-950 hover:bg-lime-300 h-11 px-6"
                >
                  <Link href="/reservar">
                    <CalendarDaysIcon className="size-4 mr-2" />
                    Reservar Cancha + Mesa
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-11 px-5"
                >
                  <a href="tel:+543816643122">
                    Consultar por Eventos
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
