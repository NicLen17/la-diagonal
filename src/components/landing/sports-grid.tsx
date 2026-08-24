import Link from "next/link";
import {
  CircleDotIcon,
  GoalIcon,
  HandIcon,
  LandPlotIcon,
  SquareIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";
import { SPORT_LABELS, type Sport } from "@/lib/data/types";

type SportCard = {
  sport: Sport;
  description: string;
  icon: typeof GoalIcon;
};

const SPORT_CARDS: SportCard[] = [
  {
    sport: "futbol_5",
    description: "Canchas de fútbol 5 con césped sintético e iluminación LED.",
    icon: GoalIcon,
  },
  {
    sport: "futbol_7",
    description: "Espacios amplios ideales para equipos de siete jugadores.",
    icon: LandPlotIcon,
  },
  {
    sport: "futbol_8",
    description: "Formato intermedio para entrenamientos y partidos amistosos.",
    icon: LandPlotIcon,
  },
  {
    sport: "futbol_9",
    description: "Canchas para torneos y competencias de nivel intermedio.",
    icon: LandPlotIcon,
  },
  {
    sport: "futbol_11",
    description: "Cancha oficial de fútbol 11 para partidos competitivos.",
    icon: GoalIcon,
  },
  {
    sport: "futsal",
    description: "Piso rígido y medidas reglamentarias para futsal.",
    icon: CircleDotIcon,
  },
  {
    sport: "handball",
    description: "Espacio multipropósito para handball y actividades indoor.",
    icon: HandIcon,
  },
  {
    sport: "padel",
    description: "Canchas de pádel con turnos de 90 minutos.",
    icon: SquareIcon,
  },
];

export function SportsGrid() {
  return (
    <DiagonalSection id="deportes" tone="muted" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Deportes"
          title="Elegí tu cancha"
          description="Múltiples formatos de fútbol, futsal, handball y pádel. Tocá un deporte para ver disponibilidad."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SPORT_CARDS.map(({ sport, description, icon: Icon }) => (
            <Link
              key={sport}
              href={`/reservar?deporte=${sport}`}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2"
            >
              <Card className="h-full transition group-hover:border-lime-400/50 group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-navy-900 text-lime-400">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="font-display text-lg uppercase">
                    {SPORT_LABELS[sport]}
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-navy-800 group-hover:text-lime-600">
                    Ver turnos →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DiagonalSection>
  );
}
