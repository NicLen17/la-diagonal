"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Landmark, MessageCircle, Percent, ArrowUpRight } from "lucide-react";
import type { Venue } from "@/lib/data/types";
import { updateVenueConfig } from "@/lib/services/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VenueConfigForm({ venue }: { venue: Venue }) {
  const [form, setForm] = useState({
    depositPercent: venue.depositPercent,
    bankAlias: venue.bankAlias,
    bankCbu: venue.bankCbu,
    bankHolder: venue.bankHolder,
    whatsappE164: venue.whatsappE164,
  });
  const [saved, setSaved] = useState(form);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          try {
            await updateVenueConfig(form);
            setSaved(form);
            toast.success("Configuración guardada");
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "No se pudo guardar. Intentá de nuevo.",
            );
          }
        });
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="size-4 text-emerald-700" aria-hidden="true" />
            Datos de transferencia
          </CardTitle>
          <CardDescription>
            Se muestran al cliente cuando elige pagar por transferencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="bank-alias">Alias bancario</Label>
            <Input
              id="bank-alias"
              name="bankAlias"
              required
              autoComplete="off"
              value={form.bankAlias}
              onChange={(e) => setForm({ ...form, bankAlias: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank-cbu">CBU</Label>
            <Input
              id="bank-cbu"
              name="bankCbu"
              required
              inputMode="numeric"
              autoComplete="off"
              value={form.bankCbu}
              onChange={(e) => setForm({ ...form, bankCbu: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bank-holder">Titular de la cuenta</Label>
            <Input
              id="bank-holder"
              name="bankHolder"
              required
              autoComplete="off"
              value={form.bankHolder}
              onChange={(e) => setForm({ ...form, bankHolder: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="size-4 text-emerald-700" aria-hidden="true" />
              Seña de reserva
            </CardTitle>
            <CardDescription>
              Porcentaje del total que se solicita para reservar con seña.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="deposit-percent">Seña (%)</Label>
            <Input
              id="deposit-percent"
              name="depositPercent"
              type="number"
              required
              min={0}
              max={100}
              value={form.depositPercent}
              onChange={(e) =>
                setForm({ ...form, depositPercent: Number(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Para un turno de $20.000, la seña sería{" "}
              {new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              }).format((20000 * form.depositPercent) / 100)}
              .
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle
                className="size-4 text-emerald-700"
                aria-hidden="true"
              />
              Contacto del complejo
            </CardTitle>
            <CardDescription>
              Número de WhatsApp para consultas de tus clientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="venue-whatsapp">WhatsApp internacional</Label>
            <Input
              id="venue-whatsapp"
              name="whatsappE164"
              type="tel"
              required
              minLength={8}
              autoComplete="tel"
              value={form.whatsappE164}
              onChange={(e) =>
                setForm({ ...form, whatsappE164: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Incluí país y área. Ejemplo: +5493815551234.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Las dimensiones del plano se editan en Canchas y predio.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/canchas?vista=mapa">
            Editar plano
            <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
        <span
          aria-live="polite"
          className="mr-auto text-xs text-muted-foreground"
        >
          {dirty ? "Tenés cambios sin guardar" : "Configuración al día"}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={!dirty || pending}
          onClick={() => {
            setForm(saved);
            setError("");
          }}
        >
          Descartar cambios
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar configuración"}
        </Button>
      </div>
    </form>
  );
}
