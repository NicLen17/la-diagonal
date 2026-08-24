import { StarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";

const GOOGLE_REVIEWS = [
  {
    author: "Martín G.",
    rating: 5,
    date: "Hace 2 meses",
    text: "Excelente complejo. Las canchas de fútbol 5 están impecables y la iluminación es perfecta para jugar de noche. Muy recomendable.",
  },
  {
    author: "Carolina R.",
    rating: 5,
    date: "Hace 4 meses",
    text: "Llevamos a los chicos a la escuelita y la atención es muy buena. Instalaciones amplias, limpias y con buen estacionamiento.",
  },
  {
    author: "Diego M.",
    rating: 4,
    date: "Hace 1 mes",
    text: "Buenas canchas de pádel y fútbol 7. Reservamos seguido con amigos. El predio es grande y se nota el cuidado desde 2017.",
  },
] as const;

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`size-4 ${i < count ? "fill-gold-400 text-gold-400" : "text-muted-foreground/30"}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <DiagonalSection tone="muted" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Opiniones"
          title="Lo que dicen en Google"
          description="Más de 700 reseñas de jugadores, familias y equipos que eligen La Diagonal."
        />

        <div className="mb-8 flex justify-center">
          <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
            <StarIcon className="size-4 fill-gold-400 text-gold-400" />
            <span className="font-semibold">4.4</span>
            <span className="text-muted-foreground">· 735 opiniones</span>
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {GOOGLE_REVIEWS.map((review) => (
            <Card key={review.author} className="h-full">
              <CardHeader>
                <Stars count={review.rating} />
                <CardTitle className="text-base font-semibold normal-case">
                  {review.author}
                </CardTitle>
                <CardDescription>{review.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{review.text}&rdquo;
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DiagonalSection>
  );
}
