"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Closure, Court, PriceRule, VenueHours } from "@/lib/data/types";
import { DAY_LABELS } from "@/lib/services/admin-stats";
import { deletePriceRule, upsertPriceRule } from "@/lib/services/admin-actions";
import { formatArs } from "@/lib/services/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { PricePreview } from "@/components/admin/price-preview";
import { cn } from "@/lib/utils";

type RuleForm = Omit<PriceRule, "id" | "venueId"> & { id?: string };
function emptyRule(): RuleForm {
  return {
    courtId: null,
    name: "",
    daysOfWeek: [1, 2, 3, 4, 5],
    startsAt: "18:00",
    endsAt: "00:00",
    priceArs: null,
    surchargeArs: 5000,
    priority: 10,
    isActive: true,
  };
}
type OptimisticChange =
  { type: "save"; rule: PriceRule } | { type: "delete"; id: string };
export function PriceRulesManager({
  rules,
  courts,
  hours,
  closures,
  initialDate,
}: {
  rules: PriceRule[];
  courts: Court[];
  hours: VenueHours[];
  closures: Closure[];
  initialDate: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RuleForm>(emptyRule);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [optimisticRules, updateRules] = useOptimistic(
    rules,
    (current, change: OptimisticChange) =>
      change.type === "delete"
        ? current.filter((r) => r.id !== change.id)
        : current.some((r) => r.id === change.rule.id)
          ? current.map((r) => (r.id === change.rule.id ? change.rule : r))
          : [...current, change.rule],
  );
  function openEditor(rule?: PriceRule) {
    setForm(rule ? { ...rule } : emptyRule());
    setError("");
    setOpen(true);
  }
  function save() {
    if (
      form.name.trim().length < 2 ||
      !form.daysOfWeek.length ||
      !form.startsAt ||
      !form.endsAt ||
      (form.priceArs === null && !form.surchargeArs) ||
      (form.priceArs !== null &&
        (!Number.isInteger(form.priceArs) || form.priceArs < 0)) ||
      (form.surchargeArs !== null && !Number.isInteger(form.surchargeArs)) ||
      !Number.isInteger(form.priority)
    ) {
      setError(
        "Completá el nombre, al menos un día, los horarios y un precio o ajuste en pesos enteros. La prioridad debe ser un número entero.",
      );
      return;
    }
    setError("");
    startTransition(async () => {
      updateRules({
        type: "save",
        rule: {
          ...form,
          id: form.id ?? "optimistic-new",
          venueId: rules[0]?.venueId ?? courts[0]?.venueId ?? "",
        },
      });
      try {
        await upsertPriceRule(form);
        toast.success(form.id ? "Regla actualizada" : "Regla creada");
        setOpen(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo guardar. Intentá de nuevo.";
        setError(message);
        toast.error(message);
      }
    });
  }
  function remove(rule: PriceRule) {
    if (
      !window.confirm(
        `¿Eliminar la regla “${rule.name}”? Los precios se recalcularán sin ella.`,
      )
    )
      return;
    startTransition(async () => {
      updateRules({ type: "delete", id: rule.id });
      try {
        await deletePriceRule(rule.id);
        toast.success("Regla eliminada");
      } catch {
        toast.error("No se pudo eliminar. Se restauró la regla.");
      }
    });
  }
  return (
    <div className="space-y-6">
      <section
        aria-label="Cómo se calculan los precios"
        className="rounded-xl border bg-accent/40 p-4"
      >
        <p className="mb-3 font-semibold">Cómo se calcula cada turno</p>
        <ol className="grid gap-3 text-sm md:grid-cols-3">
          <li>
            <span className="font-semibold">1. Precio base</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Se toma el precio definido en Canchas y predio.
            </p>
          </li>
          <li>
            <span className="font-semibold">2. Precio fijo, si aplica</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Reemplaza la base. Si coinciden varios, gana el de mayor prioridad
              (20 antes que 10). En empate, se usa el primero del orden
              guardado; usá prioridades distintas.
            </p>
          </li>
          <li>
            <span className="font-semibold">3. Se suman los ajustes</span>
            <p className="mt-1 text-xs text-muted-foreground">
              Todos los recargos aplicables se acumulan, sin importar su
              prioridad. Un importe negativo descuenta. Sólo cuentan reglas
              activas para ese día, hora y cancha.
            </p>
          </li>
        </ol>
        <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          Ejemplo: base $18.000 → fijo $20.000 + recargo $4.000 ={" "}
          <strong className="text-foreground">$24.000 por turno</strong>. Una
          regla para una cancha no desplaza automáticamente a una regla general.
        </p>
      </section>
      <section
        className="min-w-0 space-y-3"
        aria-labelledby="price-rules-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="price-rules-title">Reglas de precio</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {optimisticRules.filter((r) => r.isActive).length} activas ·
              Ordenadas por prioridad
            </p>
          </div>
          <Button onClick={() => openEditor()} disabled={pending}>
            <Plus aria-hidden="true" />
            Nueva regla
          </Button>
        </div>
        <div className="hidden min-w-0 overflow-hidden rounded-xl border bg-card md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Regla / alcance</TableHead>
                <TableHead>Días y horario</TableHead>
                <TableHead>Efecto en el precio</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {optimisticRules
                .toSorted((a, b) => b.priority - a.priority)
                .map((rule) => (
                  <TableRow
                    key={rule.id}
                    className={!rule.isActive ? "opacity-60" : undefined}
                  >
                    <TableCell>
                      <p className="font-medium">{rule.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {rule.courtId
                          ? (courts.find((c) => c.id === rule.courtId)?.name ??
                            "Cancha eliminada")
                          : "Todas las canchas"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">
                        {rule.daysOfWeek
                          .map((d) => DAY_LABELS[d].slice(0, 3))
                          .join(", ")}
                      </p>
                      <p className="mt-1 tabular-nums">
                        {rule.startsAt}–{rule.endsAt}
                      </p>
                    </TableCell>
                    <TableCell>
                      {rule.priceArs !== null ? (
                        <p>
                          Fijo: <strong>{formatArs(rule.priceArs)}</strong>
                        </p>
                      ) : null}
                      {rule.surchargeArs ? (
                        <p className="text-xs">
                          {rule.surchargeArs > 0 ? "Recargo: +" : "Descuento: "}
                          {formatArs(rule.surchargeArs)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Editar ${rule.name}`}
                          disabled={pending}
                          onClick={() => openEditor(rule)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Eliminar ${rule.name}`}
                          disabled={pending}
                          onClick={() => remove(rule)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {optimisticRules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sin reglas: se usa el precio base de cada cancha.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-3 md:hidden">
          {optimisticRules
            .toSorted((a, b) => b.priority - a.priority)
            .map((rule) => (
              <article
                key={rule.id}
                className="space-y-2 rounded-xl border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3>{rule.name}</h3>
                  <Badge variant={rule.isActive ? "default" : "outline"}>
                    {rule.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rule.courtId
                    ? (courts.find((c) => c.id === rule.courtId)?.name ??
                      "Cancha eliminada")
                    : "Todas las canchas"}{" "}
                  ·{" "}
                  {rule.daysOfWeek
                    .map((d) => DAY_LABELS[d].slice(0, 3))
                    .join(", ")}
                </p>
                <p className="text-sm tabular-nums">
                  {rule.startsAt}–{rule.endsAt} · Prioridad {rule.priority}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold tabular-nums">
                    {rule.priceArs !== null ? (
                      <p>Fijo {formatArs(rule.priceArs)}</p>
                    ) : null}
                    {rule.surchargeArs ? (
                      <p>
                        {rule.surchargeArs > 0 ? "+" : ""}
                        {formatArs(rule.surchargeArs)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {rule.surchargeArs > 0 ? "recargo" : "descuento"}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => openEditor(rule)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      aria-label={`Eliminar ${rule.name}`}
                      onClick={() => remove(rule)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          {optimisticRules.length === 0 ? (
            <p className="rounded-xl border border-dashed p-5 text-center text-muted-foreground">
              Sin reglas: se usa el precio base.
            </p>
          ) : null}
        </div>
      </section>
      <PricePreview
        courts={courts}
        rules={optimisticRules}
        hours={hours}
        closures={closures}
        initialDate={initialDate}
      />
      <AdminFormSheet
        open={open}
        onOpenChange={(value) => {
          if (!pending) setOpen(value);
        }}
        title={form.id ? "Editar regla" : "Nueva regla"}
        description="El horario se evalúa al inicio del turno. 00:00 indica medianoche."
        footer={
          <Button onClick={save} disabled={pending} className="h-11 w-full">
            {pending ? "Guardando…" : "Guardar regla"}
          </Button>
        }
      >
        <AdminField label="Nombre">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </AdminField>
        <AdminField label="Cancha">
          <Select
            value={form.courtId ?? "all"}
            onValueChange={(v) =>
              setForm({ ...form, courtId: v === "all" ? null : v })
            }
          >
            <SelectTrigger aria-label="Cancha" className="w-full">
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
        </AdminField>
        <AdminField label="Días">
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, day) => (
              <button
                key={label}
                type="button"
                aria-pressed={form.daysOfWeek.includes(day)}
                aria-label={label}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    daysOfWeek: prev.daysOfWeek.includes(day)
                      ? prev.daysOfWeek.filter((d) => d !== day)
                      : [...prev.daysOfWeek, day].sort(),
                  }))
                }
                className={cn(
                  "min-h-10 rounded-lg border px-2.5 text-xs font-medium transition-colors",
                  form.daysOfWeek.includes(day)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted",
                )}
              >
                {label.slice(0, 3)}
              </button>
            ))}
          </div>
        </AdminField>
        <div className="grid grid-cols-2 gap-4">
          <AdminField label="Desde">
            <Input
              type="time"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </AdminField>
          <AdminField label="Hasta">
            <Input
              type="time"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </AdminField>
        </div>
        <AdminField label="Precio fijo (opcional)">
          <Input
            type="number"
            min={0}
            step={1}
            value={form.priceArs ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                priceArs: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Reemplaza el precio base; dejalo vacío para conservarlo.
          </p>
        </AdminField>
        <AdminField label="Recargo o descuento (opcional)">
          <Input
            type="number"
            step={1}
            value={form.surchargeArs ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                surchargeArs:
                  e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Se suma al precio fijo o base. Usá un número negativo para
            descontar.
          </p>
        </AdminField>
        <AdminField label="Prioridad del precio fijo">
          <Input
            type="number"
            step={1}
            value={form.priority}
            onChange={(e) =>
              setForm({ ...form, priority: Number(e.target.value) })
            }
          />
          <p className="text-xs text-muted-foreground">
            Mayor número gana entre precios fijos. No evita que se sumen otros
            recargos.
          </p>
        </AdminField>
        <label className="flex items-center gap-3 rounded-xl border p-4 text-sm">
          <Checkbox
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v === true })}
          />
          Regla activa
        </label>
        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </AdminFormSheet>
    </div>
  );
}
