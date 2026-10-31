"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { Closure, Court, VenueHours } from "@/lib/data/types";
import { venueDateTime, VENUE_TIMEZONE } from "@/lib/services/venue-time";
import { DAY_LABELS } from "@/lib/services/admin-stats";
import {
  deleteClosure,
  upsertClosure,
  upsertVenueHours,
} from "@/lib/services/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HoursEditor({ hours }: { hours: VenueHours[] }) {
  const [pending, startTransition] = useTransition();

  function saveDay(dayOfWeek: number, opensAt: string, closesAt: string) {
    startTransition(async () => {
      try {
        await upsertVenueHours({ dayOfWeek, opensAt, closesAt });
        toast.success(`${DAY_LABELS[dayOfWeek]} actualizado`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar",
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario semanal</CardTitle>
        <CardDescription>
          Apertura y cierre del complejo por día (00:00 = medianoche)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const row = hours.find((h) => h.dayOfWeek === day) ?? {
            opensAt: "09:00",
            closesAt: "00:00",
          };
          return (
            <DayHoursRow
              key={day}
              day={day}
              opensAt={row.opensAt}
              closesAt={row.closesAt}
              pending={pending}
              onSave={saveDay}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

function DayHoursRow({
  day,
  opensAt: initialOpens,
  closesAt: initialCloses,
  pending,
  onSave,
}: {
  day: number;
  opensAt: string;
  closesAt: string;
  pending: boolean;
  onSave: (day: number, opens: string, closes: string) => void;
}) {
  const [opensAt, setOpensAt] = useState(initialOpens);
  const [closesAt, setClosesAt] = useState(initialCloses);

  return (
    <div className="grid grid-cols-2 items-end gap-2 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(80px,1fr)_minmax(0,110px)_minmax(0,110px)_auto]">
      <div className="self-center font-medium">{DAY_LABELS[day]}</div>
      <div className="order-2 space-y-1 sm:order-none">
        <Label htmlFor={`opens-${day}`} className="text-xs">
          Abre
        </Label>
        <Input
          id={`opens-${day}`}
          type="time"
          value={opensAt}
          onChange={(e) => setOpensAt(e.target.value)}
        />
      </div>
      <div className="order-3 space-y-1 sm:order-none">
        <Label htmlFor={`closes-${day}`} className="text-xs">
          Cierra
        </Label>
        <Input
          id={`closes-${day}`}
          type="time"
          value={closesAt === "00:00" ? "00:00" : closesAt}
          onChange={(e) => setClosesAt(e.target.value)}
        />
      </div>
      <Button
        size="sm"
        className="order-1 justify-self-end sm:order-none"
        aria-label={`Guardar horario de ${DAY_LABELS[day]}`}
        disabled={pending}
        onClick={() => onSave(day, opensAt, closesAt)}
      >
        Guardar
      </Button>
    </div>
  );
}

export function ClosuresManager({
  closures,
  courts,
}: {
  closures: Closure[];
  courts: Court[];
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    courtId: "all",
    reason: "",
    startsAt: "",
    endsAt: "",
  });

  function createClosure() {
    if (
      form.reason.trim().length < 2 ||
      !form.startsAt ||
      !form.endsAt ||
      form.endsAt <= form.startsAt
    ) {
      toast.error(
        "Completá el motivo y un período con fin posterior al inicio.",
      );
      return;
    }
    startTransition(async () => {
      try {
        await upsertClosure({
          courtId: form.courtId === "all" ? null : form.courtId,
          reason: form.reason,
          startsAt: venueDateTime(
            form.startsAt.slice(0, 10),
            form.startsAt.slice(11, 16),
          ).toISOString(),
          endsAt: venueDateTime(
            form.endsAt.slice(0, 10),
            form.endsAt.slice(11, 16),
          ).toISOString(),
        });
        toast.success("Cierre registrado");
        setForm({ courtId: "all", reason: "", startsAt: "", endsAt: "" });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al crear cierre",
        );
      }
    });
  }

  function remove(id: string) {
    if (
      !window.confirm("¿Eliminar este cierre y volver a habilitar esos turnos?")
    )
      return;
    startTransition(async () => {
      try {
        await deleteClosure(id);
        toast.success("Cierre eliminado");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al eliminar",
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierres y mantenimiento</CardTitle>
        <CardDescription>
          Bloqueos por fecha para todo el predio o una cancha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="closure-court">Alcance</Label>
            <Select
              value={form.courtId}
              onValueChange={(v) => setForm({ ...form, courtId: v })}
            >
              <SelectTrigger id="closure-court">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el predio</SelectItem>
                {courts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="closure-reason">Motivo</Label>
            <Textarea
              id="closure-reason"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={1}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="closure-start">Desde</Label>
            <Input
              id="closure-start"
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="closure-end">Hasta</Label>
            <Input
              id="closure-end"
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={createClosure} disabled={pending}>
          <Plus className="size-4" />
          Agregar cierre
        </Button>

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motivo</TableHead>
                <TableHead>Alcance</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Hasta</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {closures.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No hay cierres programados.
                  </TableCell>
                </TableRow>
              ) : null}
              {closures.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.reason}</TableCell>
                  <TableCell>
                    {c.courtId
                      ? (courts.find((x) => x.id === c.courtId)?.name ??
                        c.courtId)
                      : "Todo el predio"}
                  </TableCell>
                  <TableCell>
                    {new Date(c.startsAt).toLocaleString("es-AR", {
                      timeZone: VENUE_TIMEZONE,
                      hour12: false,
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(c.endsAt).toLocaleString("es-AR", {
                      timeZone: VENUE_TIMEZONE,
                      hour12: false,
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => remove(c.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
