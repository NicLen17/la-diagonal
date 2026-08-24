"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
    planWidthM: venue.planWidthM,
    planLengthM: venue.planLengthM,
  });
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await updateVenueConfig(form);
        toast.success("Configuración guardada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar",
        );
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración del complejo</CardTitle>
        <CardDescription>
          Datos bancarios, contacto y dimensiones del plano
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Seña (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.depositPercent}
              onChange={(e) =>
                setForm({ ...form, depositPercent: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>WhatsApp (E.164)</Label>
            <Input
              value={form.whatsappE164}
              onChange={(e) =>
                setForm({ ...form, whatsappE164: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Alias bancario</Label>
            <Input
              value={form.bankAlias}
              onChange={(e) => setForm({ ...form, bankAlias: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>CBU</Label>
            <Input
              value={form.bankCbu}
              onChange={(e) => setForm({ ...form, bankCbu: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Titular de la cuenta</Label>
            <Input
              value={form.bankHolder}
              onChange={(e) =>
                setForm({ ...form, bankHolder: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Plano ancho (m)</Label>
            <Input
              type="number"
              step={0.5}
              value={form.planWidthM}
              onChange={(e) =>
                setForm({ ...form, planWidthM: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1">
            <Label>Plano largo (m)</Label>
            <Input
              type="number"
              step={0.5}
              value={form.planLengthM}
              onChange={(e) =>
                setForm({ ...form, planLengthM: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <Button onClick={save} disabled={pending}>
          Guardar configuración
        </Button>
      </CardContent>
    </Card>
  );
}
