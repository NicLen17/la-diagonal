"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { VENUE_TIMEZONE } from "@/lib/services/venue-time";
import type { ReservationWithDetails } from "@/lib/data/types";
import { STATUS_LABELS } from "@/lib/data/types";
import { updateReservationStatusAction } from "@/lib/services/reservations";
import { formatArs } from "@/lib/services/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ReservationStatusActionsProps = {
  reservation: ReservationWithDetails;
  compact?: boolean;
  onUpdated?: () => void;
  onOptimisticStatus?: (status: "confirmed" | "cancelled" | "pending") => void;
};

export function ReservationStatusActions({
  reservation,
  compact = false,
  onUpdated,
  onOptimisticStatus,
}: ReservationStatusActionsProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    reservation.status,
    (_current, next: ReservationWithDetails["status"]) => next,
  );
  const [pending, startTransition] = useTransition();

  function updateStatus(status: "confirmed" | "cancelled" | "pending") {
    if (
      status === "cancelled" &&
      !window.confirm("¿Cancelar esta reserva y liberar el turno?")
    )
      return;
    startTransition(async () => {
      setOptimisticStatus(status);
      onOptimisticStatus?.(status);
      try {
        await updateReservationStatusAction(reservation.id, status);
        toast.success(
          status === "confirmed"
            ? "Reserva confirmada"
            : status === "cancelled"
              ? "Reserva cancelada"
              : "Reserva marcada como pendiente",
        );
        onUpdated?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo actualizar",
        );
      }
    });
  }

  const receipt = reservation.receiptPath ? (
    <a
      href={`/admin/comprobantes/${reservation.id}`}
      target="_blank"
      rel="noreferrer"
      className="text-xs font-semibold underline underline-offset-4"
    >
      Ver comprobante
    </a>
  ) : null;
  if (optimisticStatus !== "pending" && optimisticStatus !== "confirmed") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {receipt}
        <Badge variant="secondary">{STATUS_LABELS[optimisticStatus]}</Badge>
      </div>
    );
  }

  return (
    <div className={compact ? "flex gap-1" : "flex flex-wrap gap-2"}>
      {receipt}
      {optimisticStatus === "confirmed" ? (
        <Badge>Confirmada</Badge>
      ) : (
        <Button
          size={compact ? "sm" : "default"}
          disabled={pending}
          onClick={() => updateStatus("confirmed")}
        >
          Confirmar
        </Button>
      )}
      <Button
        size={compact ? "sm" : "default"}
        variant="outline"
        disabled={pending}
        onClick={() => updateStatus("cancelled")}
      >
        Cancelar
      </Button>
    </div>
  );
}

export function PendingReservationsList({
  reservations,
}: {
  reservations: ReservationWithDetails[];
}) {
  const [visible, removeOptimistic] = useOptimistic(
    reservations,
    (current, id: string) => current.filter((r) => r.id !== id),
  );
  return (
    <Card
      className={
        visible.length ? "border-amber-300 dark:border-amber-700" : undefined
      }
    >
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            {visible.length
              ? "Pendientes de confirmación"
              : "Confirmaciones al día"}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/reservas?status=pending">Ver todas</Link>
          </Button>
        </div>
        <CardDescription>
          {visible.length
            ? "Revisá primero las que llevan más tiempo esperando."
            : "No hay reservas pendientes de revisión."}
        </CardDescription>
      </CardHeader>
      {visible.length ? (
        <CardContent className="space-y-3">
          {visible.map((reservation) => (
            <div
              key={reservation.id}
              className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30"
            >
              <div>
                <p className="break-words font-semibold">
                  {reservation.court.name} · {reservation.code}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("es-AR", {
                    timeZone: VENUE_TIMEZONE,
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(reservation.startsAt))}{" "}
                  · {formatArs(reservation.priceArs)}
                </p>
                <p className="mt-1 break-words text-sm">
                  {reservation.customer.fullName}
                </p>
              </div>
              <ReservationStatusActions
                reservation={reservation}
                compact
                onOptimisticStatus={(status) => {
                  if (status !== "pending") removeOptimistic(reservation.id);
                }}
              />
            </div>
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}
