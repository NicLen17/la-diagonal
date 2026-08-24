"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DiagonalSection } from "@/components/layout/diagonal-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReservarError({
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
    <DiagonalSection tone="muted" className="py-10 sm:py-14">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>No pudimos cargar la reserva</CardTitle>
            <CardDescription>
              Ocurrió un error al obtener la disponibilidad. Intentá de nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" onClick={reset}>
              Reintentar
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DiagonalSection>
  );
}
