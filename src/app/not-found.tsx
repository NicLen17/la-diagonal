import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold tracking-widest text-lime-500 uppercase">
        404
      </p>
      <h1 className="font-display text-4xl uppercase text-navy-900">
        Página no encontrada
      </h1>
      <p className="max-w-md text-muted-foreground">
        Esa ruta no existe. Volvé al inicio o reservá una cancha.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">Inicio</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/reservar">Reservar</Link>
        </Button>
      </div>
    </div>
  );
}
