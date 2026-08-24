"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BanknoteIcon,
  CheckCircle2Icon,
  ClockIcon,
  CopyIcon,
  LandmarkIcon,
  Loader2Icon,
  ShieldCheckIcon,
  UploadIcon,
  WalletIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { PaymentMethod, Venue } from "@/lib/data/types";
import { PAYMENT_LABELS } from "@/lib/data/types";
import { completeReservationSchema } from "@/lib/data/schemas";
import { formatArs } from "@/lib/services/pricing";
import { completeReservationAction } from "@/lib/services/reservations";
import { cn } from "@/lib/utils";

const formSchema = completeReservationSchema.omit({ reservationId: true });

type FormState = z.infer<typeof formSchema>;

type ConfirmFormProps = {
  reservationId: string;
  holdExpiresAt: string | null;
  holdTtlMinutes?: number;
  priceArs: number;
  venue: Venue;
};

const PAYMENT_META: Record<
  PaymentMethod,
  { icon: typeof WalletIcon; short: string; badge: string }
> = {
  cash: { icon: BanknoteIcon, short: "Efectivo", badge: "Pagar al llegar al predio" },
  deposit: { icon: WalletIcon, short: "Seña Bancaria", badge: "Abonar seña para fijar turno" },
  transfer_full: { icon: LandmarkIcon, short: "Total 100%", badge: "Transferencia total adelantada" },
};

export function ConfirmForm({
  reservationId,
  holdExpiresAt,
  priceArs,
  venue,
}: ConfirmFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("deposit");
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000),
      );
      setSecondsLeft(diff);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [holdExpiresAt]);

  const depositArs = Math.round(priceArs * (venue.depositPercent / 100));
  const remainingAtVenue = priceArs - depositArs;
  const needsReceipt =
    paymentMethod === "deposit" || paymentMethod === "transfer_full";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${key} copiado al portapapeles`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      paymentMethod,
      receiptFileName: needsReceipt ? receiptFileName : undefined,
      notes: String(formData.get("notes") ?? "") || undefined,
    };

    const parsed = formSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key as keyof FormState]) {
          fieldErrors[key as keyof FormState] = issue.message;
        }
      }
      if (needsReceipt && !receiptFileName) {
        fieldErrors.receiptFileName = "Adjuntá el comprobante de transferencia";
      }
      setErrors(fieldErrors);
      return;
    }

    if (needsReceipt && !receiptFileName) {
      setErrors({ receiptFileName: "Adjuntá el comprobante de transferencia" });
      return;
    }

    setErrors({});
    startTransition(async () => {
      try {
        const reservation = await completeReservationAction({
          reservationId,
          ...parsed.data,
        });
        router.push(`/reserva/${reservation.code}?wa=1`);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo confirmar la reserva",
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-white">
      {/* Hold Countdown Bar */}
      {secondsLeft !== null ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors",
            secondsLeft > 180
              ? "border-lime-400/30 bg-lime-400/10 text-lime-300"
              : "border-amber-400/40 bg-amber-400/15 text-amber-200"
          )}
          role="status"
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0 animate-pulse" />
            <span className="text-xs sm:text-sm">
              {secondsLeft > 0
                ? "Tiempo restante para completar la reserva:"
                : "El tiempo de reserva temporal expiró."}
            </span>
          </div>

          {secondsLeft > 0 ? (
            <span className="font-mono text-base font-bold tracking-wider text-white">
              {formatCountdown(secondsLeft)}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Customer Info Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-lime-400">
          1. Datos del Jugador / Responsable
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.fullName}>
            <FieldLabel htmlFor="fullName" className="text-xs font-semibold text-slate-300">
              Nombre y Apellido *
            </FieldLabel>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Ej. Juan Pérez"
              required
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-lime-400"
            />
            <FieldError className="text-xs text-rose-400">{errors.fullName}</FieldError>
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone" className="text-xs font-semibold text-slate-300">
              Teléfono WhatsApp *
            </FieldLabel>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ej. 381 664 3122"
              required
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-lime-400"
            />
            <FieldError className="text-xs text-rose-400">{errors.phone}</FieldError>
          </Field>
        </div>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email" className="text-xs font-semibold text-slate-300">
            Email de contacto <span className="font-normal text-slate-500">(opcional para recibir el voucher)</span>
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tuemail@gmail.com"
            className="h-11 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-lime-400"
          />
          <FieldError className="text-xs text-rose-400">{errors.email}</FieldError>
        </Field>
      </div>

      {/* Payment Method Selector */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-lime-400">
            2. Forma de Pago
          </h3>
          <span className="text-xs font-semibold text-white">
            Total Turno: <strong className="text-lime-400 text-sm">{formatArs(priceArs)}</strong>
          </span>
        </div>

        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => {
            const meta = PAYMENT_META[method];
            const Icon = meta.icon;
            const isSelected = paymentMethod === method;
            return (
              <label
                key={method}
                htmlFor={`pay-${method}`}
                className={cn(
                  "relative flex cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98]",
                  isSelected
                    ? "border-lime-400 bg-lime-400/15 ring-2 ring-lime-400 text-white shadow-lg shadow-lime-400/10"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                )}
              >
                <RadioGroupItem
                  value={method}
                  id={`pay-${method}`}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div className={cn("flex size-9 items-center justify-center rounded-xl", isSelected ? "bg-lime-400 text-navy-950" : "bg-white/10 text-white")}>
                    <Icon className="size-5" />
                  </div>
                  {isSelected ? (
                    <CheckCircle2Icon className="size-4 text-lime-400" />
                  ) : null}
                </div>

                <div className="mt-3">
                  <span className="block text-sm font-bold text-white">
                    {meta.short}
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-400 leading-tight">
                    {method === "deposit"
                      ? `Seña de ${formatArs(depositArs)} (resta ${formatArs(remainingAtVenue)})`
                      : method === "cash"
                      ? "Pagas la totalidad al ingresar"
                      : `Total de ${formatArs(priceArs)}`}
                  </span>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Bank Account Details (When Transfer is chosen) */}
      {needsReceipt ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LandmarkIcon className="size-4 text-lime-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Datos Bancarios para Transferir
              </span>
            </div>
            <span className="text-xs font-bold text-lime-400">
              {paymentMethod === "deposit" ? `Monto Seña: ${formatArs(depositArs)}` : `Monto Total: ${formatArs(priceArs)}`}
            </span>
          </div>

          <div className="grid gap-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-black/30 p-2.5">
              <span className="text-slate-400">Titular:</span>
              <span className="font-semibold text-white">{venue.bankHolder}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-black/30 p-2.5">
              <span className="text-slate-400">Alias:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lime-400">{venue.bankAlias}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(venue.bankAlias, "Alias")}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-lime-400 hover:text-navy-950 transition"
                  aria-label="Copiar Alias"
                >
                  <CopyIcon className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-black/30 p-2.5">
              <span className="text-slate-400">CBU:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white">{venue.bankCbu}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(venue.bankCbu, "CBU")}
                  className="rounded-lg bg-white/10 p-1.5 hover:bg-lime-400 hover:text-navy-950 transition"
                  aria-label="Copiar CBU"
                >
                  <CopyIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Receipt Upload */}
      {needsReceipt ? (
        <Field data-invalid={!!errors.receiptFileName}>
          <FieldLabel htmlFor="receipt" className="text-xs font-semibold text-slate-300">
            Adjuntar Comprobante de Transferencia *
          </FieldLabel>
          <label
            htmlFor="receipt"
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-all",
              receiptFileName
                ? "border-lime-400 bg-lime-400/10 text-white"
                : "border-white/20 bg-white/5 text-slate-300 hover:border-lime-400/50 hover:bg-white/10"
            )}
          >
            <UploadIcon className="size-7 text-lime-400" />
            {receiptFileName ? (
              <div>
                <span className="block text-sm font-bold text-lime-400">{receiptFileName}</span>
                <span className="text-xs text-slate-400">Tocá para cambiar archivo</span>
              </div>
            ) : (
              <div>
                <span className="block text-sm font-semibold text-white">Subir comprobante o captura</span>
                <span className="text-xs text-slate-400">Formato JPG, PNG o PDF</span>
              </div>
            )}
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setReceiptFileName(file?.name);
              }}
            />
          </label>
          <FieldError className="text-xs text-rose-400">{errors.receiptFileName}</FieldError>
        </Field>
      ) : null}

      {/* Optional Notes */}
      <Field>
        <FieldLabel htmlFor="notes" className="text-xs font-semibold text-slate-300">
          Aclaraciones o Pedidos Especiales <span className="font-normal text-slate-500">(opcional)</span>
        </FieldLabel>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Ej. Pecheras para el partido, pelotas extras, mesa para el bar…"
          className="resize-none border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-lime-400 min-h-[70px]"
        />
      </Field>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          className="h-13 w-full bg-lime-400 text-base font-bold text-navy-950 hover:bg-lime-300 shadow-xl shadow-lime-400/20 disabled:opacity-50"
          disabled={isPending || secondsLeft === 0}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="animate-spin size-5" />
              <span>Confirmando reserva...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <ShieldCheckIcon className="size-5" />
              <span>Finalizar y Obtener Voucher</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
