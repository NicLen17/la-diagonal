import Image from "next/image";
import {
  CalendarDaysIcon,
  GraduationCapIcon,
  PartyPopperIcon,
  TrophyIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";

const SERVICES = [
  {
    icon: GraduationCapIcon,
    title: "Escuelita",
    description:
      "Formación deportiva para chicos y chicas. Entrenamientos con profesores y ambiente familiar.",
  },
  {
    icon: TrophyIcon,
    title: "Torneos",
    description:
      "Organizamos ligas y copas de fútbol, futsal y pádel para equipos de todos los niveles.",
  },
  {
    icon: PartyPopperIcon,
    title: "Eventos",
    description:
      "Cumpleaños, jornadas empresariales y actividades especiales con catering opcional.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Alquiler",
    description:
      "Canchas por hora con reserva online. Elegí deporte, horario y confirmá en minutos.",
  },
] as const;

export function Services() {
  return (
    <DiagonalSection tone="lime" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Más que canchas"
              title="Servicios del complejo"
              description="Actividades para toda la familia y opciones para equipos, empresas y escuelas."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {SERVICES.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-navy-900/10 bg-white/80">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-navy-900 text-lime-400">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <CardTitle className="font-display text-lg uppercase">
                      {title}
                    </CardTitle>
                    <CardDescription className="text-navy-800/80">
                      {description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/images/diagonal img 3.png"
              alt="Actividades en el Complejo La Diagonal"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </DiagonalSection>
  );
}
