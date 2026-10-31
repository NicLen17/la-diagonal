"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
};

export function ReservationStatusActions({
  reservation,
  compact = false,
  onUpdated,
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
  if (reservations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pendientes recientes</CardTitle>
          <CardDescription>
            No hay reservas pendientes de confirmación
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendientes recientes</CardTitle>
        <CardDescription>
          Confirmá o cancelá reservas en espera de aprobación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reservations.map((reservation) => (
          <div
            key={reservation.id}
            className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium">
                {reservation.court.name} · {reservation.code}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(reservation.startsAt), "EEE d MMM · HH:mm", {
                  locale: es,
                })}{" "}
                · {reservation.customer.fullName} ·{" "}
                {formatArs(reservation.priceArs)}
              </p>
            </div>
            <ReservationStatusActions reservation={reservation} compact />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
