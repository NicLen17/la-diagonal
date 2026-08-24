import type { ReservationWithDetails } from "@/lib/data/types";
import { PAYMENT_LABELS, SPORT_LABELS } from "@/lib/data/types";
import { formatArs } from "./pricing";

export function buildReservationMessage(
  reservation: ReservationWithDetails,
): string {
  const date = new Date(reservation.startsAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const start = new Date(reservation.startsAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const end = new Date(reservation.endsAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const lines = [
    `⚽ *Nueva reserva — La Diagonal*`,
    ``,
    `*Código:* ${reservation.code}`,
    `*Cancha:* ${reservation.court.name}`,
    `*Deporte:* ${SPORT_LABELS[reservation.court.sport]}`,
    `*Fecha:* ${date}`,
    `*Horario:* ${start} – ${end}`,
    `*Precio:* ${formatArs(reservation.priceArs)}`,
    `*Pago:* ${PAYMENT_LABELS[reservation.paymentMethod]}`,
  ];

  if (reservation.depositArs > 0) {
    lines.push(`*Seña:* ${formatArs(reservation.depositArs)}`);
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

  lines.push(``, `_Enviado desde la web de La Diagonal_`);
  return lines.join("\n");
}

export function buildWhatsAppUrl(
  phoneE164: string,
  message: string,
): string {
  const digits = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
