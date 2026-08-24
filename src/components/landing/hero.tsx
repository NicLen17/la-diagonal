import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Venue } from "@/lib/data/types";

export function Hero({ venue }: { venue: Venue }) {
  return (
    <section className="relative isolate min-h-[85vh] clip-diagonal-bottom overflow-hidden bg-navy-950 text-white">
      <Image
        src="/images/Diagonal img 1.png"
        alt="Vista aérea del Complejo Deportivo La Diagonal"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-navy-900/75" aria-hidden />

      <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
        <Badge
          variant="secondary"
          className="mb-6 w-fit gap-1.5 border-white/10 bg-white/10 text-white backdrop-blur"
        >
          <StarIcon className="size-3.5 fill-gold-400 text-gold-400" />
          <span className="font-semibold">4.4</span>
          <span className="text-white/80">(735 opiniones en Google)</span>
        </Badge>

        <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Jugá en La Diagonal
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/85 sm:text-xl">
          Fútbol 5, 7, 9 y 11, futsal, handball y pádel en Tafí Viejo. Reservá
          tu cancha online y confirmá por WhatsApp.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-11 px-6 text-base">
            <Link href="/reservar">Reservar cancha</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="h-11 border-white/20 bg-white/10 px-6 text-base text-white hover:bg-white/20"
          >
            <a href={venue.whatsappContactUrl} target="_blank" rel="noreferrer">
              Escribinos por WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
