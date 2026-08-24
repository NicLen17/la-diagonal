"use client";

import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ReservationCodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">ID de reserva</p>
        <p className="font-mono text-lg font-semibold tracking-wide">{code}</p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0 rounded-full"
            aria-label="Qué es el ID de reserva"
          >
            <InfoIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-4">
          <PopoverHeader>
            <PopoverTitle>¿Para qué sirve el ID?</PopoverTitle>
            <PopoverDescription>
              Es el código único de tu turno. Usalo para:
            </PopoverDescription>
          </PopoverHeader>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            <li>Consultar la reserva en Mis reservas</li>
            <li>Identificarte al llegar al predio</li>
            <li>Enviar el turno por WhatsApp al complejo</li>
          </ul>
        </PopoverContent>
      </Popover>
      <CopyButton
        value={code}
        label="Copiar ID de reserva"
        variant="outline"
        size="icon-sm"
        className="shrink-0"
      />
    </div>
  );
}
