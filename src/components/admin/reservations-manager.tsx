"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  MessageCircleIcon,
  PhoneIcon,
  SearchIcon,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return reservations.filter((r) => {
      if (q) {
        const matchCode = r.code.toLowerCase().includes(q);
        const matchName = r.customer.fullName.toLowerCase().includes(q);
        const matchPhone = r.customer.phoneE164.includes(q);
        if (!matchCode && !matchName && !matchPhone) return false;
      }
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
  }, [courtFilter, dateFilter, paymentFilter, reservations, searchQuery, statusFilter]);

  const agendaDate = dateFilter || format(new Date(), "yyyy-MM-dd");
  const agendaItems = filtered.filter(
    (r) => format(new Date(r.startsAt), "yyyy-MM-dd") === agendaDate,
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-11 p-1 bg-muted/60">
            <TabsTrigger value="tabla" className="px-5 text-xs font-semibold">
              Vista Tabla ({filtered.length})
            </TabsTrigger>
            <TabsTrigger value="agenda" className="px-5 text-xs font-semibold">
              Agenda del Día ({agendaItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente, tel o código…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="my-5 grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Fecha</Label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Cancha</Label>
            <Select value={courtFilter} onValueChange={setCourtFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todas las canchas" />
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
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">Método de Pago</Label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos los métodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Tab Content */}
        <TabsContent value="tabla" className="mt-0">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-bold text-xs">Código</TableHead>
                    <TableHead className="font-bold text-xs">Fecha & Hora</TableHead>
                    <TableHead className="font-bold text-xs">Cancha</TableHead>
                    <TableHead className="font-bold text-xs">Cliente / Teléfono</TableHead>
                    <TableHead className="font-bold text-xs">Estado</TableHead>
                    <TableHead className="font-bold text-xs">Pago</TableHead>
                    <TableHead className="font-bold text-xs">Total / Seña</TableHead>
                    <TableHead className="text-right font-bold text-xs">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground text-xs">
                        No se encontraron reservas con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const waChat = waLink(
                        r.customer.phoneE164,
                        `¡Hola ${r.customer.fullName}! Te escribimos desde el Complejo La Diagonal sobre tu reserva ${r.code}.`
                      );
                      return (
                        <TableRow key={r.id} className="hover:bg-muted/30 transition">
                          <TableCell className="font-mono text-xs font-bold text-lime-600 dark:text-lime-400">
                            {r.code}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold block">
                              {format(new Date(r.startsAt), "HH:mm")} – {format(new Date(r.endsAt), "HH:mm")} hs
                            </span>
                            <span className="text-[11px] text-muted-foreground capitalize">
                              {format(new Date(r.startsAt), "EEE d MMM", { locale: es })}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {r.court.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-medium block">{r.customer.fullName}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <a href={`tel:${r.customer.phoneE164}`} className="hover:underline flex items-center gap-1">
                                <PhoneIcon className="size-3" />
                                {r.customer.phoneE164}
                              </a>
                              <a
                                href={waChat}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-lime-600 dark:text-lime-400 hover:underline font-semibold"
                              >
                                <MessageCircleIcon className="size-3" />
                                Chat
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(r.status)} className="text-[10px] font-semibold">
                              {STATUS_LABELS[r.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {PAYMENT_LABELS[r.paymentMethod as PaymentMethod]}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-bold text-foreground block">{formatArs(r.priceArs)}</span>
                            {r.depositArs > 0 ? (
                              <span className="text-[10px] text-lime-600 dark:text-lime-400">Seña: {formatArs(r.depositArs)}</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            <ReservationStatusActions reservation={r} compact />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Agenda Tab Content */}
        <TabsContent value="agenda" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partidos programados para el {format(new Date(agendaDate), "EEEE d 'de' MMMM", { locale: es })}:
              </p>
              <Badge variant="outline" className="text-xs">
                {agendaItems.length} turnos
              </Badge>
            </div>

            {agendaItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-10 text-center text-xs text-muted-foreground">
                No hay reservas cargadas para esta fecha.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agendaItems
                  .sort(
                    (a, b) =>
                      new Date(a.startsAt).getTime() -
                      new Date(b.startsAt).getTime(),
                  )
                  .map((r) => {
                    const waChat = waLink(
                      r.customer.phoneE164,
                      `¡Hola ${r.customer.fullName}! Te escribimos desde el Complejo La Diagonal para confirmar tu partido hoy a las ${format(new Date(r.startsAt), "HH:mm")} hs en ${r.court.name}.`
                    );
                    return (
                      <div
                        key={r.id}
                        className="flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm hover:border-lime-400/50 transition gap-3"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs font-bold">
                              {r.court.name}
                            </Badge>
                            <span className="font-mono text-xs font-bold text-lime-500">
                              {r.code}
                            </span>
                          </div>

                          <div className="mt-3">
                            <span className="text-xl font-bold font-display text-foreground">
                              {format(new Date(r.startsAt), "HH:mm")} – {format(new Date(r.endsAt), "HH:mm")} hs
                            </span>
                            <p className="text-xs font-semibold text-foreground mt-1">
                              {r.customer.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.customer.phoneE164}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {formatArs(r.priceArs)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {PAYMENT_LABELS[r.paymentMethod as PaymentMethod]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
                              <a href={waChat} target="_blank" rel="noreferrer">
                                <MessageCircleIcon className="size-3.5 text-lime-500" />
                              </a>
                            </Button>
                            <ReservationStatusActions reservation={r} compact />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
