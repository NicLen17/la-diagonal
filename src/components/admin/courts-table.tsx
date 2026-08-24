"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Court, Sport } from "@/lib/data/types";
import { SPORT_LABELS } from "@/lib/data/types";
import { deleteCourt, upsertCourt } from "@/lib/services/admin-actions";
import { formatArs } from "@/lib/services/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva cancha
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
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
            {courts.map((court) => (
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
                      onClick={() => openEdit(court)}
                      aria-label="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(court.id)}
                      aria-label="Eliminar"
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Editar cancha" : "Nueva cancha"}</SheetTitle>
            <SheetDescription>
              Datos de la cancha y posición en el plano
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Deporte</Label>
              <Select
                value={form.sport}
                onValueChange={(v) =>
                  setForm({ ...form, sport: v as Sport })
                }
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Precio base</Label>
                <Input
                  type="number"
                  value={form.basePriceArs}
                  onChange={(e) =>
                    setForm({ ...form, basePriceArs: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Duración (min)</Label>
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
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(v) =>
                  setForm({ ...form, isActive: v === true })
                }
              />
              Cancha activa
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.hasLights}
                onCheckedChange={(v) =>
                  setForm({ ...form, hasLights: v === true })
                }
              />
              Iluminación
            </label>
            <Button onClick={save} disabled={pending} className="w-full">
              Guardar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
