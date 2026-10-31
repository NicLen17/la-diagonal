"use client";

import { useMemo, useState } from "react";
import type { Closure, Court, PriceRule, VenueHours } from "@/lib/data/types";
import { generateSlots, formatTimeLabel } from "@/lib/services/availability";
import { formatArs, resolvePriceBreakdown } from "@/lib/services/pricing";
import { groupPriceSlots } from "@/lib/services/price-preview";
import { venueDateTime } from "@/lib/services/venue-time";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricePreview({
  courts,
  rules,
  hours,
  closures,
  initialDate,
}: {
  courts: Court[];
  rules: PriceRule[];
  hours: VenueHours[];
  closures: Closure[];
  initialDate: string;
}) {
  const [date, setDate] = useState(initialDate);
  const [courtId, setCourtId] = useState("all");
  const preview = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
    return courts
      .filter(
        (court) =>
          court.isActive && (courtId === "all" || court.id === courtId),
      )
      .map((court) => {
        const slots = generateSlots({
          court,
          date: venueDateTime(date, "12:00"),
          venueHours: hours,
          reservations: [],
          closures,
          priceRules: rules,
        });
        const bands = groupPriceSlots(slots, (slot) => {
          const breakdown = resolvePriceBreakdown(
            court,
            new Date(slot.startsAt),
            rules,
          );
          return JSON.stringify([
            breakdown.fixedRule?.id,
            breakdown.surcharges.map((rule) => rule.id),
          ]);
        });
        return { court, bands };
      });
  }, [date, courtId, courts, hours, closures, rules]);
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Vista previa de precios</CardTitle>
            <CardDescription className="mt-1">
              Franjas con el mismo precio, agrupadas para comparar de un
              vistazo.
            </CardDescription>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price-date">Fecha</Label>
              <Input
                id="price-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price-court">Cancha</Label>
              <select
                id="price-court"
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="h-9 w-full min-w-0 rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">Todas las activas</option>
                {courts
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          El importe corresponde a un turno completo. La tarifa se toma al
          inicio del turno. Abrí una franja para ver el cálculo. Los cierres
          aparecen señalados; esta vista no consulta reservas.
        </p>
        <div className="divide-y" aria-live="polite">
          {preview.map(({ court, bands }) => (
            <div
              key={court.id}
              className="grid gap-3 py-3 first:pt-0 last:pb-0 md:grid-cols-[180px_minmax(0,1fr)]"
            >
              <div>
                <p className="font-semibold">{court.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {court.slotDurationMinutes} min · Base{" "}
                  {formatArs(court.basePriceArs)}
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap items-start gap-2">
                {bands.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin turnos en el horario de apertura.
                  </p>
                ) : (
                  bands.map((band) => {
                    const breakdown = resolvePriceBreakdown(
                      court,
                      new Date(band.startsAt),
                      rules,
                    );
                    return (
                      <details
                        key={band.startsAt}
                        className={`min-w-0 flex-1 basis-44 rounded-xl border ${band.available ? "bg-muted/30" : "border-amber-300 bg-amber-50 text-amber-950"}`}
                      >
                        <summary className="cursor-pointer rounded-xl px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                          <span className="font-medium tabular-nums">
                            {formatTimeLabel(band.startsAt)}–
                            {formatTimeLabel(band.endsAt)}
                          </span>
                          <strong className="ml-3 tabular-nums">
                            {formatArs(band.priceArs)}
                          </strong>
                          <span className="mt-1 block text-xs opacity-75">
                            {`${band.count} ${band.count === 1 ? "turno" : "turnos"}`}
                            {!band.available ? " · Cerrado" : ""} · Ver cálculo
                          </span>
                        </summary>
                        <div className="space-y-1 border-t px-3 py-2 text-xs">
                          <p>
                            {breakdown.fixedRule
                              ? `Precio fijo: ${breakdown.fixedRule.name}`
                              : "Precio base de la cancha"}
                            : <strong>{formatArs(breakdown.base)}</strong>
                          </p>
                          {breakdown.surcharges.map((rule) => (
                            <p key={rule.id}>
                              {rule.name}: {rule.surchargeArs! >= 0 ? "+" : ""}
                              {formatArs(rule.surchargeArs!)}
                            </p>
                          ))}
                          <p className="pt-1 font-semibold">
                            Total por turno: {formatArs(breakdown.total)}
                          </p>
                          <p className="text-muted-foreground">
                            Inicios cada {court.slotDurationMinutes} min, hasta{" "}
                            {formatTimeLabel(
                              new Date(
                                new Date(band.endsAt).getTime() -
                                  court.slotDurationMinutes * 60000,
                              ).toISOString(),
                            )}
                            .
                          </p>
                        </div>
                      </details>
                    );
                  })
                )}
              </div>
            </div>
          ))}
          {!date ? (
            <p className="py-6 text-center text-muted-foreground">
              Elegí una fecha para consultar las tarifas.
            </p>
          ) : preview.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No hay canchas activas para mostrar.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
