"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Court, PriceRule } from "@/lib/data/types";
import { DAY_LABELS } from "@/lib/services/admin-stats";
import { deletePriceRule, upsertPriceRule } from "@/lib/services/admin-actions";
import { formatArs, resolvePrice } from "@/lib/services/pricing";
import { generateSlots } from "@/lib/services/availability";
import type { Closure, VenueHours } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RuleForm = {
  id?: string;
  courtId: string | null;
  name: string;
  daysOfWeek: number[];
  startsAt: string;
  endsAt: string;
  priceArs: number | null;
  surchargeArs: number | null;
  priority: number;
  isActive: boolean;
};

function emptyRule(): RuleForm {
  return {
    courtId: null,
    name: "",
    daysOfWeek: [1, 2, 3, 4, 5],
    startsAt: "18:00",
    endsAt: "23:00",
    priceArs: null,
    surchargeArs: 5000,
    priority: 10,
    isActive: true,
  };
}

export function PriceRulesManager({
  rules,
  courts,
  hours,
  closures,
}: {
  rules: PriceRule[];
  courts: Court[];
  hours: VenueHours[];
  closures: Closure[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RuleForm>(emptyRule);
  const [previewDate, setPreviewDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setForm(emptyRule());
    setOpen(true);
  }

  function openEdit(rule: PriceRule) {
    setForm({
      id: rule.id,
      courtId: rule.courtId,
      name: rule.name,
      daysOfWeek: rule.daysOfWeek,
      startsAt: rule.startsAt,
      endsAt: rule.endsAt,
      priceArs: rule.priceArs,
      surchargeArs: rule.surchargeArs,
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      try {
        await upsertPriceRule(form);
        toast.success(form.id ? "Regla actualizada" : "Regla creada");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar",
        );
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deletePriceRule(id);
        toast.success("Regla eliminada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al eliminar",
        );
      }
    });
  }

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  }

  const previewGrid = useMemo(() => {
    const date = new Date(previewDate);
    return courts
      .filter((c) => c.isActive)
      .map((court) => {
        const slots = generateSlots({
          court,
          date,
          venueHours: hours,
          reservations: [],
          closures,
          priceRules: rules,
        });
        return {
          court,
          slots: slots.map((s) => ({
            time: new Date(s.startsAt).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            price: resolvePrice(court, new Date(s.startsAt), rules),
          })),
        };
      });
  }, [closures, courts, hours, previewDate, rules]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva regla
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cancha</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Precio / recargo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>
                  {rule.courtId
                    ? courts.find((c) => c.id === rule.courtId)?.name ?? "—"
                    : "Todas"}
                </TableCell>
                <TableCell className="text-xs">
                  {rule.daysOfWeek.map((d) => DAY_LABELS[d].slice(0, 3)).join(", ")}
                </TableCell>
                <TableCell>
                  {rule.startsAt} – {rule.endsAt}
                </TableCell>
                <TableCell>
                  {rule.priceArs !== null
                    ? formatArs(rule.priceArs)
                    : rule.surchargeArs
                      ? `+${formatArs(rule.surchargeArs)}`
                      : "—"}
                </TableCell>
                <TableCell>{rule.priority}</TableCell>
                <TableCell>
                  <Badge variant={rule.isActive ? "default" : "secondary"}>
                    {rule.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(rule)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(rule.id)}
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

      <Card>
        <CardHeader>
          <CardTitle>Vista previa de precios</CardTitle>
          <CardDescription>
            Precio resuelto por cancha y hora para la fecha seleccionada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-xs space-y-1">
            <Label>Fecha</Label>
            <Input
              type="date"
              value={previewDate}
              onChange={(e) => setPreviewDate(e.target.value)}
            />
          </div>
          <div className="space-y-4">
            {previewGrid.map(({ court, slots }) => (
              <div key={court.id}>
                <p className="mb-2 font-medium">{court.name}</p>
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => (
                    <span
                      key={`${court.id}-${s.time}`}
                      className="rounded-md border bg-muted/50 px-2 py-1 text-xs"
                    >
                      {s.time}: {formatArs(s.price)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Editar regla" : "Nueva regla"}</SheetTitle>
            <SheetDescription>
              Reglas de precio por día, horario y cancha
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
              <Label>Cancha</Label>
              <Select
                value={form.courtId ?? "all"}
                onValueChange={(v) =>
                  setForm({ ...form, courtId: v === "all" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las canchas</SelectItem>
                  {courts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Días</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, day) => (
                  <label
                    key={label}
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                  >
                    <Checkbox
                      checked={form.daysOfWeek.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    {label.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Desde</Label>
                <Input
                  type="time"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hasta</Label>
                <Input
                  type="time"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Precio fijo (opcional)</Label>
                <Input
                  type="number"
                  value={form.priceArs ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priceArs: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Recargo (opcional)</Label>
                <Input
                  type="number"
                  value={form.surchargeArs ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      surchargeArs: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Prioridad</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(v) =>
                  setForm({ ...form, isActive: v === true })
                }
              />
              Regla activa
            </label>
            <Button onClick={save} disabled={pending} className="w-full">
              Guardar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
