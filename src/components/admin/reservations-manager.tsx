"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Court, ReservationWithDetails } from "@/lib/data/types";
import {
  PAYMENT_LABELS,
  STATUS_LABELS,
  type PaymentMethod,
  type ReservationStatus,
} from "@/lib/data/types";
import { formatArs } from "@/lib/services/pricing";
import { ReservationStatusActions } from "@/components/admin/reservation-actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function waLink(phoneE164: string, text: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function statusVariant(status: ReservationStatus) {
  switch (status) {
    case "confirmed":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "cancelled":
    case "expired":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

export function ReservationsManager({
  reservations,
  courts,
  defaultTab = "tabla",
}: {
  reservations: ReservationWithDetails[];
  courts: Court[];
  defaultTab?: "tabla" | "agenda";
}) {
  const [dateFilter, setDateFilter] = useState("");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (dateFilter) {
        const day = format(new Date(r.startsAt), "yyyy-MM-dd");
        if (day !== dateFilter) return false;
      }
      if (courtFilter !== "all" && r.courtId !== courtFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (paymentFilter !== "all" && r.paymentMethod !== paymentFilter)
        return false;
      return true;
    });
  }, [courtFilter, dateFilter, paymentFilter, reservations, statusFilter]);

  const agendaDate = dateFilter || format(new Date(), "yyyy-MM-dd");
  const agendaItems = filtered.filter(
    (r) => format(new Date(r.startsAt), "yyyy-MM-dd") === agendaDate,
  );

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList>
        <TabsTrigger value="tabla">Tabla</TabsTrigger>
        <TabsTrigger value="agenda">Agenda del día</TabsTrigger>
      </TabsList>

      <div className="my-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Cancha</Label>
          <Select value={courtFilter} onValueChange={setCourtFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {courts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Pago</Label>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TabsContent value="tabla">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha / hora</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Comprobante</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No hay reservas con esos filtros
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell>
                      {format(new Date(r.startsAt), "d MMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>{r.court.name}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p>{r.customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          <a
                            href={`tel:${r.customer.phoneE164}`}
                            className="hover:underline"
                          >
                            {r.customer.phoneE164}
                          </a>
                          {" · "}
                          <a
                            href={waLink(
                              r.customer.phoneE164,
                              `Hola ${r.customer.fullName}, consulta reserva ${r.code}`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            WhatsApp
                          </a>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>
                        {STATUS_LABELS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {PAYMENT_LABELS[r.paymentMethod as PaymentMethod]}
                    </TableCell>
                    <TableCell>{formatArs(r.priceArs)}</TableCell>
                    <TableCell className="max-w-[120px] truncate text-xs">
                      {r.receiptFileName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <ReservationStatusActions reservation={r} compact />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="agenda">
        <p className="mb-3 text-sm text-muted-foreground">
          Agenda para{" "}
          {format(new Date(agendaDate), "EEEE d 'de' MMMM", { locale: es })}
        </p>
        <div className="space-y-2">
          {agendaItems.length === 0 ? (
            <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              Sin reservas para este día
            </p>
          ) : (
            agendaItems
              .sort(
                (a, b) =>
                  new Date(a.startsAt).getTime() -
                  new Date(b.startsAt).getTime(),
              )
              .map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(r.startsAt), "HH:mm")} –{" "}
                      {format(new Date(r.endsAt), "HH:mm")} · {r.court.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {r.customer.fullName} · {r.code} ·{" "}
                      {STATUS_LABELS[r.status]}
                    </p>
                  </div>
                  <ReservationStatusActions reservation={r} compact />
                </div>
              ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
