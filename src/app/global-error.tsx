"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-950 p-6 text-white">
        <h1 className="font-display text-3xl uppercase">Algo salió mal</h1>
        <p className="max-w-md text-center text-white/70">
          Hubo un error inesperado. Podés reintentar o volver al inicio.
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Reintentar</Button>
          <Button asChild variant="secondary">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </body>
    </html>
  );
}
