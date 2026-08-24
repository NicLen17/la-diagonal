"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, MotionProvider } from "@/components/motion/motion-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ReservationWithDetails } from "@/lib/data/types";
import {
  PAYMENT_LABELS,
  SPORT_LABELS,
  STATUS_LABELS,
} from "@/lib/data/types";
import { formatTimeLabel } from "@/lib/services/availability";
import { formatArs } from "@/lib/services/pricing";
import { lookupReservationAction } from "@/lib/services/reservations";

export function LookupForm() {
  const [result, setResult] = useState<ReservationWithDetails | null | "empty">(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!code || !phone) {
      toast.error("Completá código y teléfono");
      return;
    }

    startTransition(async () => {
      try {
        const reservation = await lookupReservationAction({ code, phone });
        setResult(reservation ?? "empty");
        if (!reservation) {
          toast.message("No encontramos una reserva con esos datos");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al buscar la reserva",
        );
      }
    });
  };

  return (
    <MotionProvider>
      <FadeIn>
        <Card>
          <CardHeader>
            <CardTitle>Buscar reserva</CardTitle>
            <CardDescription>
              El código aparece en la confirmación (ej. LD-ABC123).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="code">Código</FieldLabel>
                  <Input
                    id="code"
                    name="code"
                    placeholder="LD-XXXXXX"
                    autoComplete="off"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Ej. 381 555 1234"
                    autoComplete="tel"
                    required
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2Icon className="animate-spin" data-icon="inline-start" />
                      Buscando…
                    </>
                  ) : (
                    <>
                      <SearchIcon data-icon="inline-start" />
                      Buscar
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            {result === "empty" ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                No hay reservas que coincidan. Verificá el código y el teléfono.
              </p>
            ) : null}

            {result && result !== "empty" ? (
              <ReservationSummary reservation={result} />
            ) : null}
          </CardContent>
        </Card>
      </FadeIn>
    </MotionProvider>
  );
}

function ReservationSummary({
  reservation,
}: {
  reservation: ReservationWithDetails;
}) {
  const dateLabel = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{reservation.code}</p>
        <Badge variant="secondary">{STATUS_LABELS[reservation.status]}</Badge>
      </div>
      <p>{reservation.court.name}</p>
      <p className="text-muted-foreground">
        {SPORT_LABELS[reservation.court.sport]} · {dateLabel}
      </p>
      <p>
        {formatTimeLabel(reservation.startsAt)} –{" "}
        {formatTimeLabel(reservation.endsAt)} · {formatArs(reservation.priceArs)}
      </p>
      <p className="text-muted-foreground">
        {PAYMENT_LABELS[reservation.paymentMethod]}
      </p>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href={`/reserva/${reservation.code}`}>Ver detalle</Link>
      </Button>
    </div>
  );
}
