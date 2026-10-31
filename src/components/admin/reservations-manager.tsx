"use client";

import { useDeferredValue, useEffect, useMemo, useOptimistic } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  venueDateKey,
  venueDateTime,
  VENUE_TIMEZONE,
} from "@/lib/services/venue-time";
import { formatTimeLabel } from "@/lib/services/availability";
import { MessageCircleIcon, PhoneIcon, SearchIcon } from "lucide-react";
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
}: {
  reservations: ReservationWithDetails[];
  courts: Court[];
}) {
  const router = useRouter();
  const [optimisticReservations, updateOptimistic] = useOptimistic(
    reservations,
    (current, update: { id: string; status: ReservationStatus }) =>
      current.map((reservation) =>
        reservation.id === update.id
          ? { ...reservation, status: update.status }
          : reservation,
      ),
  );
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [router]);
  const params = useSearchParams();
  function updateFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (name !== "pagina") next.delete("pagina");
    if (!value || value === "all") next.delete(name);
    else next.set(name, value);
    window.history.replaceState(
      null,
      "",
      next.size ? "?" + next.toString() : "/admin/reservas",
    );
  }
  const searchQuery = params.get("q") ?? "";
  const deferredQuery = useDeferredValue(searchQuery);
  const dateFilter = params.get("fecha") ?? "";
  const courtFilter = params.get("cancha") ?? "all";
  const statusFilter = params.get("status") ?? "all";
  const paymentFilter = params.get("pago") ?? "all";
  const tab = params.get("tab") === "agenda" ? "agenda" : "tabla";
  const setSearchQuery = (v: string) => updateFilter("q", v);
  const setDateFilter = (v: string) => updateFilter("fecha", v);
  const setCourtFilter = (v: string) => updateFilter("cancha", v);
  const setStatusFilter = (v: string) => updateFilter("status", v);
  const setPaymentFilter = (v: string) => updateFilter("pago", v);

  const filtered = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    return optimisticReservations.filter((r) => {
      if (q) {
        const matchCode = r.code.toLowerCase().includes(q);
        const matchName = r.customer.fullName.toLowerCase().includes(q);
        const matchPhone = r.customer.phoneE164.includes(q);
        if (!matchCode && !matchName && !matchPhone) return false;
      }
      if (dateFilter) {
        const day = venueDateKey(new Date(r.startsAt));
        if (day !== dateFilter) return false;
      }
      if (courtFilter !== "all" && r.courtId !== courtFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (paymentFilter !== "all" && r.paymentMethod !== paymentFilter)
        return false;
      return true;
    });
  }, [
    courtFilter,
    dateFilter,
    paymentFilter,
    optimisticReservations,
    deferredQuery,
    statusFilter,
  ]);

  const agendaDate = dateFilter || venueDateKey(new Date());
  const agendaItems = filtered.filter(
    (r) =>
      venueDateKey(new Date(r.startsAt)) === agendaDate &&
      (statusFilter !== "all" ||
        r.status === "pending" ||
        r.status === "confirmed"),
  );

  const pageSize = 20;
  const itemsCount = tab === "agenda" ? agendaItems.length : filtered.length;
  const pageCount = Math.max(1, Math.ceil(itemsCount / pageSize));
  const requestedPage = Number(params.get("pagina") ?? 1);
  const currentPage = Math.min(
    pageCount,
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
  );
  const tableRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const agendaRows = agendaItems
    .toSorted((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <Tabs
        value={tab}
        onValueChange={(v) => updateFilter("tab", v)}
        className="min-w-0 w-full"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-11 w-full p-1 bg-muted/60 sm:w-auto">
            <TabsTrigger value="tabla" className="px-3 text-xs font-semibold">
              Vista Tabla ({filtered.length})
            </TabsTrigger>
            <TabsTrigger value="agenda" className="px-3 text-xs font-semibold">
              Agenda del Día ({agendaItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              aria-label="Buscar reservas por cliente, teléfono o código"
              type="search"
              placeholder="Buscar por cliente, tel o código…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="my-4 grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
          <div className="space-y-1">
            <Label
              htmlFor="reservation-date"
              className="text-xs font-semibold text-muted-foreground"
            >
              Fecha
            </Label>
            <Input
              id="reservation-date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted-foreground">
              Cancha
            </Label>
            <Select value={courtFilter} onValueChange={setCourtFilter}>
              <SelectTrigger aria-label="Cancha" className="h-9 text-xs">
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
            <Label className="text-xs font-semibold text-muted-foreground">
              Estado
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Estado" className="h-9 text-xs">
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
            <Label className="text-xs font-semibold text-muted-foreground">
              Método de Pago
            </Label>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger
                aria-label="Método de pago"
                className="h-9 text-xs"
              >
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

        {dateFilter ||
        courtFilter !== "all" ||
        statusFilter !== "all" ||
        paymentFilter !== "all" ||
        searchQuery ? (
          <div className="mb-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <p aria-live="polite">{filtered.length} reservas encontradas</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                window.history.replaceState(
                  null,
                  "",
                  tab === "agenda" ? "?tab=agenda" : "/admin/reservas",
                )
              }
            >
              Limpiar filtros
            </Button>
          </div>
        ) : null}
        {/* Table Tab Content */}
        <TabsContent value="tabla" className="mt-0">
          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-bold text-xs">Código</TableHead>
                    <TableHead className="font-bold text-xs">
                      Fecha & Hora
                    </TableHead>
                    <TableHead className="font-bold text-xs">Cancha</TableHead>
                    <TableHead className="font-bold text-xs">
                      Cliente / Teléfono
                    </TableHead>
                    <TableHead className="font-bold text-xs">Estado</TableHead>
                    <TableHead className="font-bold text-xs">Pago</TableHead>
                    <TableHead className="font-bold text-xs">
                      Total / Seña
                    </TableHead>
                    <TableHead className="text-right font-bold text-xs">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-32 text-center text-muted-foreground text-xs"
                      >
                        No se encontraron reservas con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tableRows.map((r) => {
                      const waChat = waLink(
                        r.customer.phoneE164,
                        `¡Hola ${r.customer.fullName}! Te escribimos desde ${r.venue.name} sobre tu reserva ${r.code}.`,
                      );
                      return (
                        <TableRow
                          key={r.id}
                          className="hover:bg-muted/30 transition"
                        >
                          <TableCell className="font-mono text-xs font-bold text-emerald-700 dark:text-lime-400">
                            {r.code}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold block">
                              {formatTimeLabel(r.startsAt)} –{" "}
                              {formatTimeLabel(r.endsAt)} hs
                            </span>
                            <span className="text-[11px] text-muted-foreground capitalize">
                              {new Intl.DateTimeFormat("es-AR", {
                                timeZone: VENUE_TIMEZONE,
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              }).format(new Date(r.startsAt))}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-semibold">
                            {r.court.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-medium block">
                              {r.customer.fullName}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                              <a
                                href={`tel:${r.customer.phoneE164}`}
                                className="hover:underline flex items-center gap-1"
                              >
                                <PhoneIcon className="size-3" />
                                {r.customer.phoneE164}
                              </a>
                              <a
                                hidden={!r.customer.phoneE164}
                                href={waChat}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-700 dark:text-lime-400 hover:underline font-semibold"
                              >
                                <MessageCircleIcon className="size-3" />
                                Chat
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariant(r.status)}
                              className="text-[10px] font-semibold"
                            >
                              {STATUS_LABELS[r.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {PAYMENT_LABELS[r.paymentMethod as PaymentMethod]}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-bold text-foreground block">
                              {formatArs(r.priceArs)}
                            </span>
                            {r.depositArs > 0 ? (
                              <span className="text-[10px] text-lime-600 dark:text-lime-400">
                                Seña: {formatArs(r.depositArs)}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            <ReservationStatusActions
                              reservation={r}
                              compact
                              onOptimisticStatus={(status) =>
                                updateOptimistic({ id: r.id, status })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="space-y-3 md:hidden">
            {tableRows.length === 0 ? (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No hay reservas con estos filtros.
              </p>
            ) : (
              tableRows.map((r) => (
                <article
                  key={r.id}
                  className="space-y-3 rounded-xl border bg-card p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{r.court.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "pending"
                          ? "border-amber-300 bg-amber-50 text-amber-900"
                          : undefined
                      }
                    >
                      {STATUS_LABELS[r.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold tabular-nums">
                      {new Intl.DateTimeFormat("es-AR", {
                        timeZone: VENUE_TIMEZONE,
                        day: "numeric",
                        month: "short",
                      }).format(new Date(r.startsAt))}{" "}
                      · {formatTimeLabel(r.startsAt)}–
                      {formatTimeLabel(r.endsAt)}
                    </p>
                    <p className="mt-1 break-words">{r.customer.fullName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.code} · {PAYMENT_LABELS[r.paymentMethod]}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold tabular-nums">
                      {formatArs(r.priceArs)}
                    </span>
                    <a
                      hidden={!r.customer.phoneE164}
                      className="text-xs font-medium text-emerald-700 underline underline-offset-4"
                      href={waLink(
                        r.customer.phoneE164,
                        "Hola " +
                          r.customer.fullName +
                          ", te escribimos sobre tu reserva " +
                          r.code,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Contactar por WhatsApp
                    </a>
                  </div>
                  <ReservationStatusActions
                    reservation={r}
                    compact
                    onOptimisticStatus={(status) =>
                      updateOptimistic({ id: r.id, status })
                    }
                  />
                </article>
              ))
            )}
          </div>
        </TabsContent>

        {/* Agenda Tab Content */}
        <TabsContent value="agenda" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partidos programados para el{" "}
                {new Intl.DateTimeFormat("es-AR", {
                  timeZone: VENUE_TIMEZONE,
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(venueDateTime(agendaDate, "12:00"))}
                :
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
                {agendaRows.map((r) => {
                  const waChat = waLink(
                    r.customer.phoneE164,
                    `¡Hola ${r.customer.fullName}! Te escribimos desde ${r.venue.name} para confirmar tu partido hoy a las ${formatTimeLabel(r.startsAt)} hs en ${r.court.name}.`,
                  );
                  return (
                    <div
                      key={r.id}
                      className="flex flex-col justify-between rounded-2xl border bg-card p-4 shadow-sm hover:border-lime-400/50 transition gap-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs font-bold"
                          >
                            {r.court.name}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-lime-500">
                            {r.code}
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="text-xl font-bold tabular-nums text-foreground">
                            {formatTimeLabel(r.startsAt)} –{" "}
                            {formatTimeLabel(r.endsAt)} hs
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

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs"
                          >
                            <a
                              hidden={!r.customer.phoneE164}
                              href={waChat}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Contactar a ${r.customer.fullName} por WhatsApp`}
                            >
                              <MessageCircleIcon className="size-3.5 text-lime-500" />
                            </a>
                          </Button>
                          <ReservationStatusActions
                            reservation={r}
                            compact
                            onOptimisticStatus={(status) =>
                              updateOptimistic({ id: r.id, status })
                            }
                          />
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
      {pageCount > 1 ? (
        <nav
          aria-label="Paginación de reservas"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-xs text-muted-foreground">
            Página {currentPage} de {pageCount} · {itemsCount} reservas
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => updateFilter("pagina", String(currentPage - 1))}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === pageCount}
              onClick={() => updateFilter("pagina", String(currentPage + 1))}
            >
              Siguiente
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
