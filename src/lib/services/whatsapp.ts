import type { ReservationWithDetails } from "@/lib/data/types";
import { PAYMENT_LABELS, SPORT_LABELS, STATUS_LABELS } from "@/lib/data/types";
import { formatArs } from "./pricing";

export function buildReservationMessage(
  reservation: ReservationWithDetails,
): string {
  const date = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    timeZone: reservation.venue.timezone,
    day: "2-digit",
    month: "long",
  });
  const start = new Date(reservation.startsAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: reservation.venue.timezone,
  });
  const end = new Date(reservation.endsAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: reservation.venue.timezone,
  });

  const lines = [
    `*Nueva reserva — ${reservation.venue.name}*`,
    ``,
    `*Código:* ${reservation.code}`,
    `*Estado:* ${STATUS_LABELS[reservation.status]}`,
    `*Cancha:* ${reservation.court.name}`,
    `*Deporte:* ${SPORT_LABELS[reservation.court.sport]}`,
    `*Fecha:* ${date}`,
    `*Horario:* ${start} – ${end}`,
    `*Precio:* ${formatArs(reservation.priceArs)}`,
    `*Pago:* ${PAYMENT_LABELS[reservation.paymentMethod]}`,
  ];

  if (reservation.depositArs > 0) {
    lines.push(
      `*Importe declarado a verificar:* ${formatArs(reservation.depositArs)}`,
    );
  }

  lines.push(
    ``,
    `*Reservante*`,
    `${reservation.customer.fullName}`,
    `${reservation.customer.phoneE164}`,
  );

  if (reservation.customer.email) {
    lines.push(reservation.customer.email);
  }

  if (reservation.receiptFileName) {
    lines.push(``, `📎 Comprobante: ${reservation.receiptFileName}`);
  }

  lines.push(
    ``,
    `_Estado de la reserva: ${STATUS_LABELS[reservation.status]}. La validación de pagos es manual._`,
    `_Enviado desde Cancha Manager · Demo_`,
  );
  return lines.join("\n");
}

export function buildWhatsAppUrl(phoneE164: string, message: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
