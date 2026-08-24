import Image from "next/image";
import {
  BabyIcon,
  CheckCircle2Icon,
  GraduationCapIcon,
  MessageCircleIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className + " fill-current"} aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
    </svg>
  );
}

const CATEGORIAS = [
  {
    icon: BabyIcon,
    name: "Cebollitas",
    ages: "4 a 6 años",
    schedule: "Martes y Jueves 18:00 hs",
    desc: "Iniciación deportiva a través del juego, coordinación motriz y diversión.",
    badgeColor: "bg-lime-400/20 text-lime-400 border-lime-400/30",
  },
  {
    icon: UsersIcon,
    name: "Pre-Infantiles",
    ages: "7 a 9 años",
    schedule: "Lunes, Miércoles y Viernes 18:00 hs",
    desc: "Fundamentos técnicos, pase, control, compañerismo y toma de decisiones.",
    badgeColor: "bg-sky-400/20 text-sky-300 border-sky-400/30",
  },
  {
    icon: TrophyIcon,
    name: "Infantiles",
    ages: "10 a 13 años",
    schedule: "Lunes a Viernes 19:00 hs",
    desc: "Táctica básica, partidos formativos, preparación física adaptada y torneos.",
    badgeColor: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  },
];

const BENEFICIOS = [
  "Profesores de Educación Física e instructores capacitados",
  "Instalaciones seguras y canchas sintéticas de primer nivel",
  "Enfoque 100% formativo donde todos juegan y aprenden",
  "Espacio familiar con cantina y estacionamiento privado",
];

export function EscuelitaSection() {
  const whatsappUrl =
    "https://wa.me/5493816643122?text=" +
    encodeURIComponent(
      "¡Hola! Quisiera información e inscribir a mi hijo/a en la Escuelita de Fútbol La Diagonal."
    );

  return (
    <section id="escuelita" className="relative overflow-hidden bg-navy-950 py-20 text-white">
      {/* Background sports texture */}
      <div className="absolute inset-0 bg-field-lines opacity-10" aria-hidden />
      <div className="absolute -left-40 top-1/2 size-96 rounded-full bg-lime-400/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge
              variant="secondary"
              className="mb-3 gap-1.5 border-lime-400/30 bg-lime-400/10 px-3.5 py-1 text-xs font-semibold text-lime-400 backdrop-blur"
            >
              <GraduationCapIcon className="size-4" />
              <span>Formación Deportiva Infantil</span>
            </Badge>

            <h2 className="font-display text-3xl tracking-wide uppercase sm:text-5xl md:text-6xl text-white">
              Escuelita de Fútbol <br />
              <span className="text-lime-400">Infantiles y Cebollitas</span>
            </h2>

            <p className="mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
              El espacio donde los más chicos aprenden a jugar en equipo, desarrollan su pasión por el fútbol y crecen en un entorno seguro y familiar.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              asChild
              size="lg"
              className="h-12 bg-lime-400 px-6 font-bold text-navy-950 hover:bg-lime-300"
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                <MessageCircleIcon className="size-5" />
                <span>Inscribite por WhatsApp</span>
              </a>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="h-12 border-white/20 bg-white/10 px-5 text-white hover:bg-white/20"
            >
              <a
                href="https://instagram.com/ladiagonal.reddecomplejos"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <InstagramIcon className="size-5 text-rose-400" />
                <span>@ladiagonal.reddecomplejos</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Official Banner Feature Card */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/15 bg-navy-900/80 shadow-2xl backdrop-blur-md">
          <div className="grid items-center gap-6 lg:grid-cols-12">
            <div className="relative aspect-[16/6] w-full overflow-hidden sm:aspect-[21/8] lg:col-span-7 lg:aspect-auto lg:h-full lg:min-h-[320px]">
              <Image
                src="/images/escuelita-banner.png"
                alt="Banner oficial Escuelita de Fútbol Infantiles y Cebollitas La Diagonal"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent lg:hidden" />
            </div>

            <div className="p-6 sm:p-8 lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                <SparklesIcon className="size-4" />
                <span>Inscripciones Abiertas Todo el Año</span>
              </div>

              <h3 className="mt-2 font-display text-2xl uppercase tracking-wide sm:text-3xl text-white">
                ¡Sumá a tu hijo a entrenar!
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Grupos reducidos organizados por edades para garantizar el desarrollo integral y la atención personalizada de cada alumno.
              </p>

              <div className="mt-5 space-y-2.5">
                {BENEFICIOS.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2Icon className="size-4 shrink-0 text-lime-400 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card
                key={cat.name}
                className="border-white/10 bg-navy-900/60 backdrop-blur transition-all duration-300 hover:border-lime-400/50 hover:bg-navy-900/90"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                      <Icon className="size-6" />
                    </div>
                    <Badge variant="outline" className={cat.badgeColor + " text-xs font-semibold"}>
                      {cat.ages}
                    </Badge>
                  </div>

                  <h4 className="mt-4 font-display text-xl uppercase tracking-wide text-white">
                    {cat.name}
                  </h4>

                  <p className="mt-1 text-xs font-medium text-lime-400">
                    {cat.schedule}
                  </p>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {cat.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
