"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Court, Sport } from "@/lib/data/types";
import { SPORT_LABELS } from "@/lib/data/types";
import { deleteCourt, upsertCourt } from "@/lib/services/admin-actions";
import { formatArs } from "@/lib/services/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AdminField,
  AdminFormSheet,
} from "@/components/admin/admin-form-sheet";

type CourtFormState = {
  id?: string;
  name: string;
  sport: Sport;
  description: string;
  surface: Court["surface"];
  hasLights: boolean;
  slotDurationMinutes: number;
  basePriceArs: number;
  planX_m: number;
  planY_m: number;
  planWidthM: number;
  planLengthM: number;
  planRotationDeg: number;
  sortOrder: number;
  isActive: boolean;
};

function emptyForm(sortOrder: number): CourtFormState {
  return {
    name: "",
    sport: "futbol_5",
    description: "",
    surface: "cesped_sintetico",
    hasLights: true,
    slotDurationMinutes: 60,
    basePriceArs: 18000,
    planX_m: 0,
    planY_m: 0,
    planWidthM: 20,
    planLengthM: 14,
    planRotationDeg: 0,
    sortOrder,
    isActive: true,
  };
}

function courtToForm(court: Court): CourtFormState {
  return {
    id: court.id,
    name: court.name,
    sport: court.sport,
    description: court.description,
    surface: court.surface,
    hasLights: court.hasLights,
    slotDurationMinutes: court.slotDurationMinutes,
    basePriceArs: court.basePriceArs,
    planX_m: court.planX_m,
    planY_m: court.planY_m,
    planWidthM: court.planWidthM,
    planLengthM: court.planLengthM,
    planRotationDeg: court.planRotationDeg,
    sortOrder: court.sortOrder,
    isActive: court.isActive,
  };
}

export function CourtsTable({ courts }: { courts: Court[] }) {
  const [visibleCourts, removeOptimistic] = useOptimistic(
    courts,
    (current, id: string) => current.filter((court) => court.id !== id),
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CourtFormState>(() =>
    emptyForm(courts.length + 1),
  );
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyForm(courts.length + 1));
    setOpen(true);
  }

  function openEdit(court: Court) {
    setForm(courtToForm(court));
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      try {
        await upsertCourt(form);
        toast.success(form.id ? "Cancha actualizada" : "Cancha creada");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar",
        );
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta cancha?")) return;
    startTransition(async () => {
      try {
        removeOptimistic(id);
        await deleteCourt(id);
        toast.success("Cancha eliminada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al eliminar",
        );
      }
    });
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2>Listado de canchas</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Editá tarifas base y duración. Usá el plano para ajustar la
            distribución.
          </p>
        </div>
        <Button onClick={openCreate} disabled={pending}>
          <Plus className="size-4" />
          Nueva cancha
        </Button>
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Deporte</TableHead>
              <TableHead>Precio base</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCourts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Todavía no hay canchas. Agregá la primera.
                </TableCell>
              </TableRow>
            ) : null}
            {visibleCourts.map((court) => (
              <TableRow key={court.id}>
                <TableCell className="font-medium">{court.name}</TableCell>
                <TableCell>{SPORT_LABELS[court.sport]}</TableCell>
                <TableCell>{formatArs(court.basePriceArs)}</TableCell>
                <TableCell>{court.slotDurationMinutes} min</TableCell>
                <TableCell>
                  <Badge variant={court.isActive ? "default" : "secondary"}>
                    {court.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => openEdit(court)}
                      aria-label={`Editar ${court.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => remove(court.id)}
                      aria-label={`Eliminar ${court.name}`}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {visibleCourts.map((court) => (
          <article
            key={court.id}
            className="space-y-3 rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3>{court.name}</h3>
              <Badge variant={court.isActive ? "default" : "outline"}>
                {court.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {SPORT_LABELS[court.sport]} · {court.slotDurationMinutes} min por
              turno
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold tabular-nums">
                {formatArs(court.basePriceArs)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  base
                </span>
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => openEdit(court)}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar ${court.name}`}
                  disabled={pending}
                  onClick={() => remove(court.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          </article>
        ))}
        {visibleCourts.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            Todavía no hay canchas. Agregá la primera.
          </p>
        ) : null}
      </div>
      <AdminFormSheet
        open={open}
        onOpenChange={setOpen}
        title={form.id ? "Editar cancha" : "Nueva cancha"}
        description="Datos de la cancha y posición en el plano"
        footer={
          <Button onClick={save} disabled={pending} className="h-11 w-full">
            {pending ? "Guardando…" : "Guardar cancha"}
          </Button>
        }
      >
        <AdminField label="Nombre">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </AdminField>
        <AdminField label="Deporte">
          <Select
            value={form.sport}
            onValueChange={(v) => setForm({ ...form, sport: v as Sport })}
          >
            <SelectTrigger aria-label="Deporte" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SPORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AdminField>
        <AdminField label="Descripción">
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="min-h-24"
          />
        </AdminField>
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Precio base">
            <Input
              type="number"
              value={form.basePriceArs}
              onChange={(e) =>
                setForm({ ...form, basePriceArs: Number(e.target.value) })
              }
            />
          </AdminField>
          <AdminField label="Duración (min)">
            <Input
              type="number"
              value={form.slotDurationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  slotDurationMinutes: Number(e.target.value),
                })
              }
            />
          </AdminField>
        </div>
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm transition-colors hover:text-foreground">
            <Checkbox
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm({ ...form, isActive: v === true })
              }
            />
            Cancha activa
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm transition-colors hover:text-foreground">
            <Checkbox
              checked={form.hasLights}
              onCheckedChange={(v) =>
                setForm({ ...form, hasLights: v === true })
              }
            />
            Iluminación
          </label>
        </div>
      </AdminFormSheet>
    </>
  );
}
