"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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

const formSchema = completeReservationSchema.omit({ reservationId: true });

type FormState = z.infer<typeof formSchema>;

type ConfirmFormProps = {
  reservationId: string;
  holdExpiresAt: string | null;
  holdTtlMinutes: number;
  priceArs: number;
  venue: Venue;
};

export function ConfirmForm({
  reservationId,
  holdExpiresAt,
  holdTtlMinutes,
  priceArs,
  venue,
}: ConfirmFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
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
  const needsReceipt =
    paymentMethod === "deposit" || paymentMethod === "transfer_full";

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
        fieldErrors.receiptFileName = "Adjuntá el comprobante";
      }
      setErrors(fieldErrors);
      return;
    }

    if (needsReceipt && !receiptFileName) {
      setErrors({ receiptFileName: "Adjuntá el comprobante" });
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {secondsLeft !== null ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {secondsLeft > 0 ? (
            <>
              Tiempo restante:{" "}
              <span className="font-mono font-semibold">
                {formatCountdown(secondsLeft)}
              </span>
            </>
          ) : (
            <>El hold expiró. Volvé a elegir un turno.</>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Tenés {holdTtlMinutes} minutos para completar esta reserva.
        </p>
      )}

      <FieldGroup>
        <Field data-invalid={!!errors.fullName}>
          <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
          <Input id="fullName" name="fullName" autoComplete="name" required />
          <FieldError>{errors.fullName}</FieldError>
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Ej. 381 555 1234"
            required
          />
          <FieldError>{errors.phone}</FieldError>
        </Field>
      </FieldGroup>

      <FieldGroup>
        <Field>
          <FieldLabel>Forma de pago</FieldLabel>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="gap-3"
          >
            {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
              <FieldLabel
                key={method}
                htmlFor={`pay-${method}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem value={method} id={`pay-${method}`} />
                <div className="space-y-1">
                  <span className="font-medium">{PAYMENT_LABELS[method]}</span>
                  {method === "cash" ? (
                    <FieldDescription>
                      Pagás el total en el complejo al llegar.
                    </FieldDescription>
                  ) : null}
                  {method === "deposit" ? (
                    <FieldDescription>
                      Seña del {venue.depositPercent}% ({formatArs(depositArs)})
                      por transferencia.
                    </FieldDescription>
                  ) : null}
                  {method === "transfer_full" ? (
                    <FieldDescription>
                      Transferencia por el total ({formatArs(priceArs)}).
                    </FieldDescription>
                  ) : null}
                </div>
              </FieldLabel>
            ))}
          </RadioGroup>
        </Field>

        {needsReceipt ? (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
            <p className="font-medium">Datos para transferir</p>
            <p>
              <span className="text-muted-foreground">Titular: </span>
              {venue.bankHolder}
            </p>
            <p>
              <span className="text-muted-foreground">Alias: </span>
              {venue.bankAlias}
            </p>
            <p>
              <span className="text-muted-foreground">CBU: </span>
              {venue.bankCbu}
            </p>
          </div>
        ) : null}

        {needsReceipt ? (
          <Field data-invalid={!!errors.receiptFileName}>
            <FieldLabel htmlFor="receipt">Comprobante</FieldLabel>
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setReceiptFileName(file?.name);
              }}
            />
            <FieldDescription>
              En esta demo solo guardamos el nombre del archivo.
            </FieldDescription>
            <FieldError>{errors.receiptFileName}</FieldError>
          </Field>
        ) : null}
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Ej. necesito pelotas, llegamos 10 min antes…"
        />
      </Field>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || secondsLeft === 0}
      >
        {isPending ? (
          <>
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
            Confirmando…
          </>
        ) : (
          "Confirmar reserva"
        )}
      </Button>
    </form>
  );
}

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
