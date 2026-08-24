"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ListIcon, Loader2Icon, MapIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { PlanListView, PlanMap } from "@/components/map/plan-map";
import { FadeIn, MotionProvider } from "@/components/motion/motion-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Court, Slot, Sport, Venue } from "@/lib/data/types";
import { SPORT_LABELS } from "@/lib/data/types";
import {
  summarizeCourtAvailability,
  formatTimeLabel,
} from "@/lib/services/availability";
import {
  buildBookingSearchParams,
  collectHourLabels,
  findStartsAtForHour,
  type BookingView,
} from "@/lib/services/booking-helpers";
import { formatArs } from "@/lib/services/pricing";
import { createHoldAction } from "@/lib/services/reservations";
import { cn } from "@/lib/utils";

type BookingBoardProps = {
  venue: Venue;
  courts: Court[];
  slotsByCourt: Record<string, Slot[]>;
  initialFecha: string;
  initialDeporte?: Sport;
  initialHora?: string;
  initialCancha?: string;
  initialVista: BookingView;
};

export function BookingBoard({
  venue,
  courts,
  slotsByCourt,
  initialFecha,
  initialDeporte,
  initialHora,
  initialCancha,
  initialVista,
}: BookingBoardProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(
    initialCancha ?? null,
  );
  const [selectedSlotStartsAt, setSelectedSlotStartsAt] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hourLabels = useMemo(
    () => collectHourLabels(slotsByCourt),
    [slotsByCourt],
  );

  const selectedStartsAt = useMemo(() => {
    if (!initialHora) return null;
    return findStartsAtForHour(slotsByCourt, initialHora);
  }, [initialHora, slotsByCourt]);

  const planCourts = useMemo(
    () =>
      courts.map((court) => ({
        court,
        summary: summarizeCourtAvailability(
          slotsByCourt[court.id] ?? [],
          selectedStartsAt,
        ),
      })),
    [courts, slotsByCourt, selectedStartsAt],
  );

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? null;
  const courtSlots = useMemo(
    () =>
      selectedCourtId ? (slotsByCourt[selectedCourtId] ?? []) : [],
    [selectedCourtId, slotsByCourt],
  );
  const availableCourtSlots = useMemo(
    () => courtSlots.filter((s) => s.available),
    [courtSlots],
  );

  const activeSlot = useMemo(() => {
    if (selectedSlotStartsAt) {
      return courtSlots.find((s) => s.startsAt === selectedSlotStartsAt) ?? null;
    }
    if (initialHora) {
      const match = courtSlots.find(
        (s) => s.available && formatTimeLabel(s.startsAt) === initialHora,
      );
      if (match) return match;
    }
    return availableCourtSlots[0] ?? null;
  }, [
    availableCourtSlots,
    courtSlots,
    initialHora,
    selectedSlotStartsAt,
  ]);

  const sportOptions = useMemo(() => {
    const sports = new Set(courts.map((c) => c.sport));
    return [...sports].sort();
  }, [courts]);

  const updateUrl = useCallback(
    (patch: {
      fecha?: string;
      deporte?: Sport | undefined;
      hora?: string | undefined;
      cancha?: string | undefined;
      vista?: BookingView;
    }) => {
      if ("cancha" in patch) {
        setSelectedCourtId(patch.cancha ?? null);
        setSelectedSlotStartsAt(null);
      }
      const query = buildBookingSearchParams({
        fecha: patch.fecha ?? initialFecha,
        deporte: "deporte" in patch ? patch.deporte : initialDeporte,
        hora: "hora" in patch ? patch.hora : initialHora,
        cancha:
          "cancha" in patch ? patch.cancha : (selectedCourtId ?? undefined),
        vista: patch.vista ?? initialVista,
      });
      startTransition(() => {
        router.replace(`/reservar?${query}`);
      });
    },
    [
      initialDeporte,
      initialFecha,
      initialHora,
      initialVista,
      router,
      selectedCourtId,
    ],
  );

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourtId(courtId);
    setSelectedSlotStartsAt(null);
    updateUrl({ cancha: courtId });
  };

  const handleClosePanel = () => {
    setSelectedCourtId(null);
    setSelectedSlotStartsAt(null);
    updateUrl({ cancha: undefined });
  };

  const handleContinue = async () => {
    if (!selectedCourt || !activeSlot) {
      toast.error("Elegí un turno disponible para continuar");
      return;
    }
    if (!activeSlot.available) {
      toast.error("Ese turno ya no está disponible");
      return;
    }

    setIsSubmitting(true);
    try {
      const reservation = await createHoldAction({
        courtId: selectedCourt.id,
        startsAt: activeSlot.startsAt,
        endsAt: activeSlot.endsAt,
      });
      router.push(`/reservar/confirmar?hold=${reservation.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo reservar el turno",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelContent = selectedCourt ? (
    <CourtDetailPanel
      court={selectedCourt}
      activeSlot={activeSlot}
      courtSlots={courtSlots}
      availableSlots={availableCourtSlots}
      selectedHour={initialHora}
      onSelectSlot={setSelectedSlotStartsAt}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
      onClose={handleClosePanel}
      showClose={isMobile}
    />
  ) : null;

  return (
    <MotionProvider>
      <FadeIn className="space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={initialFecha}
                min={toTodayInput()}
                onChange={(e) =>
                  updateUrl({ fecha: e.target.value, cancha: undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deporte">Deporte</Label>
              <Select
                value={initialDeporte ?? "all"}
                onValueChange={(value) =>
                  updateUrl({
                    deporte: value === "all" ? undefined : (value as Sport),
                    cancha: undefined,
                  })
                }
              >
                <SelectTrigger id="deporte" className="w-full">
                  <SelectValue placeholder="Todos los deportes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los deportes</SelectItem>
                  {sportOptions.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {SPORT_LABELS[sport]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <Button
                type="button"
                variant={initialVista === "mapa" ? "default" : "outline"}
                className="flex-1"
                onClick={() => updateUrl({ vista: "mapa" })}
              >
                <MapIcon data-icon="inline-start" />
                Mapa
              </Button>
              <Button
                type="button"
                variant={initialVista === "lista" ? "default" : "outline"}
                className="flex-1"
                onClick={() => updateUrl({ vista: "lista" })}
              >
                <ListIcon data-icon="inline-start" />
                Lista
              </Button>
            </div>
          </div>

          {hourLabels.length > 0 ? (
            <div className="space-y-2">
              <Label>Horario</Label>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  {hourLabels.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      size="sm"
                      variant={initialHora === hour ? "default" : "outline"}
                      className="shrink-0"
                      onClick={() =>
                        updateUrl({ hora: hour, cancha: undefined })
                      }
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay turnos para esta fecha{initialDeporte ? " y deporte" : ""}.
            </p>
          )}
        </div>

        <div
          className={cn(
            "relative grid gap-6",
            selectedCourt && !isMobile && "lg:grid-cols-[1fr_320px]",
          )}
        >
          <div className={cn("min-w-0", isPending && "opacity-60")}>
            {initialVista === "lista" ? (
              <PlanListView
                courts={planCourts}
                selectedCourtId={selectedCourtId}
                onSelectCourt={handleSelectCourt}
              />
            ) : (
              <PlanMap
                venue={venue}
                courts={planCourts}
                mode="select"
                selectedHourLabel={initialHora ?? null}
                selectedCourtId={selectedCourtId}
                onSelectCourt={handleSelectCourt}
              />
            )}
          </div>

          {selectedCourt && !isMobile ? (
            <aside className="rounded-2xl border bg-card shadow-sm">
              {panelContent}
            </aside>
          ) : null}
        </div>

        {selectedCourt && isMobile ? (
          <Drawer open onOpenChange={(open) => !open && handleClosePanel()}>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader className="sr-only">
                <DrawerTitle>{selectedCourt.name}</DrawerTitle>
              </DrawerHeader>
              {panelContent}
            </DrawerContent>
          </Drawer>
        ) : null}
      </FadeIn>
    </MotionProvider>
  );
}

function CourtDetailPanel({
  court,
  activeSlot,
  courtSlots,
  availableSlots,
  selectedHour,
  onSelectSlot,
  onContinue,
  isSubmitting,
  onClose,
  showClose,
}: {
  court: Court;
  activeSlot: Slot | null;
  courtSlots: Slot[];
  availableSlots: Slot[];
  selectedHour?: string;
  onSelectSlot: (startsAt: string) => void;
  onContinue: () => void;
  isSubmitting: boolean;
  onClose: () => void;
  showClose: boolean;
}) {
  const hourPrice = selectedHour
    ? courtSlotsPriceLabel(courtSlots, availableSlots, selectedHour)
    : null;

  return (
    <div className="flex flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg uppercase">{court.name}</h3>
          <p className="text-sm text-muted-foreground">
            {SPORT_LABELS[court.sport]}
          </p>
        </div>
        {showClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {court.description}
      </p>

      {hourPrice ? (
        <div className="mb-4 rounded-lg bg-muted/60 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Precio a las {selectedHour}: </span>
          <span className="font-semibold">{hourPrice}</span>
        </div>
      ) : null}

      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium">Turnos disponibles</p>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin cupos libres para este día.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => {
              const label = formatTimeLabel(slot.startsAt);
              const isActive = activeSlot?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => onSelectSlot(slot.startsAt)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    isActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "hover:bg-muted",
                  )}
                >
                  <span className="font-medium">{label}</span>
                  <Badge variant="secondary" className="ml-2">
                    {formatArs(slot.priceArs)}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={!activeSlot || isSubmitting}
        onClick={onContinue}
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="animate-spin" data-icon="inline-start" />
            Reservando…
          </>
        ) : (
          "Continuar"
        )}
      </Button>
    </div>
  );
}

function courtSlotsPriceLabel(
  allSlots: Slot[],
  availableSlots: Slot[],
  hour: string,
): string | null {
  const slot =
    allSlots.find((s) => formatTimeLabel(s.startsAt) === hour) ??
    availableSlots.find((s) => formatTimeLabel(s.startsAt) === hour);
  if (!slot) return "No disponible";
  if (!slot.available) return "Ocupado";
  return formatArs(slot.priceArs);
}

function toTodayInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
