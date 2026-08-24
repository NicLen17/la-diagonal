"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  ListIcon,
  Loader2Icon,
  MapIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
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

// Generates next 7 days for the fast date carousel
function getNextSevenDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    let label = "";
    if (i === 0) label = "Hoy";
    else if (i === 1) label = "Mañana";
    else {
      label = d.toLocaleDateString("es-AR", { weekday: "short" });
      label = label.charAt(0).toUpperCase() + label.slice(1).replace(".", "");
    }

    days.push({
      isoDate,
      dayLabel: label,
      dayNumber: d.getDate(),
      monthLabel: d.toLocaleDateString("es-AR", { month: "short" }).toUpperCase(),
    });
  }
  return days;
}

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

  const quickDays = useMemo(() => getNextSevenDays(), []);

  const slotsForHours = useMemo(() => {
    if (!initialDeporte) return slotsByCourt;
    return Object.fromEntries(
      Object.entries(slotsByCourt).filter(([courtId]) =>
        courts.some((c) => c.id === courtId && c.sport === initialDeporte),
      ),
    );
  }, [courts, initialDeporte, slotsByCourt]);

  const hourLabels = useMemo(
    () => collectHourLabels(slotsForHours),
    [slotsForHours],
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
      scrollableSlots={!isMobile}
    />
  ) : null;

  return (
    <MotionProvider>
      <FadeIn className="space-y-6">
        {/* Step Indicator Header */}
        <div className="rounded-3xl border border-white/10 bg-navy-950 p-4 sm:p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
                <SparklesIcon className="size-4" />
                <span>Paso 1 de 2: Elegí Cancha y Turno</span>
              </div>
              <h1 className="mt-1 font-display text-2xl uppercase tracking-wide sm:text-3xl text-white">
                Disponibilidad en Vivo
              </h1>
              <p className="mt-0.5 text-xs text-slate-300 sm:text-sm">
                Seleccioná fecha, deporte y el horario que mejor le quede a tu equipo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={initialVista === "mapa" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 px-4 text-xs font-semibold",
                  initialVista === "mapa"
                    ? "bg-lime-400 font-bold text-navy-950 hover:bg-lime-300"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                )}
                onClick={() => updateUrl({ vista: "mapa" })}
              >
                <MapIcon className="size-4 mr-1.5" />
                Vista Mapa
              </Button>
              <Button
                type="button"
                variant={initialVista === "lista" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-10 px-4 text-xs font-semibold",
                  initialVista === "lista"
                    ? "bg-lime-400 font-bold text-navy-950 hover:bg-lime-300"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                )}
                onClick={() => updateUrl({ vista: "lista" })}
              >
                <ListIcon className="size-4 mr-1.5" />
                Vista Lista
              </Button>
            </div>
          </div>

          {/* Quick Date Carousel */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Seleccionar Día:
              </span>
              <div className="flex items-center gap-1.5 text-xs text-lime-400">
                <CalendarDaysIcon className="size-3.5" />
                <input
                  type="date"
                  value={initialFecha}
                  min={toTodayInput()}
                  onChange={(e) =>
                    updateUrl({ fecha: e.target.value, cancha: undefined })
                  }
                  className="bg-transparent text-xs text-lime-400 underline cursor-pointer focus:outline-none"
                  aria-label="Elegir otra fecha"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {quickDays.map((day) => {
                const isSelected = initialFecha === day.isoDate;
                return (
                  <button
                    key={day.isoDate}
                    type="button"
                    onClick={() =>
                      updateUrl({ fecha: day.isoDate, cancha: undefined })
                    }
                    className={cn(
                      "flex min-w-[72px] flex-col items-center justify-center rounded-2xl border p-2.5 transition-all duration-200 active:scale-95",
                      isSelected
                        ? "border-lime-400 bg-lime-400 text-navy-950 shadow-lg shadow-lime-400/20 font-bold"
                        : "border-white/10 bg-white/5 text-white hover:border-white/25 hover:bg-white/10"
                    )}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {day.dayLabel}
                    </span>
                    <span className="text-xl font-display leading-tight">
                      {day.dayNumber}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70">
                      {day.monthLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Sports Pills */}
          <div className="mt-4">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Filtrar Deporte:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateUrl({ deporte: undefined, cancha: undefined })}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
                  !initialDeporte
                    ? "border-lime-400 bg-lime-400/20 text-lime-400 font-bold"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                Todos los deportes
              </button>

              {sportOptions.map((sport) => {
                const isSelected = initialDeporte === sport;
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => updateUrl({ deporte: sport, cancha: undefined })}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all active:scale-95",
                      isSelected
                        ? "border-lime-400 bg-lime-400/20 text-lime-400 font-bold"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {SPORT_LABELS[sport]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Time Slots Strip */}
          {hourLabels.length > 0 ? (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  3. Horarios Disponibles:
                </span>
                {initialHora ? (
                  <button
                    type="button"
                    onClick={() => updateUrl({ hora: undefined, cancha: undefined })}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Limpiar horario
                  </button>
                ) : null}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {hourLabels.map((hour) => {
                  const isSelected = initialHora === hour;
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() =>
                        updateUrl({
                          hora: isSelected ? undefined : hour,
                          cancha: undefined,
                        })
                      }
                      className={cn(
                        "rounded-xl border px-3 py-2 text-xs font-medium transition-all shrink-0 active:scale-95",
                        isSelected
                          ? "border-lime-400 bg-lime-400 text-navy-950 font-bold shadow-md shadow-lime-400/20"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-lime-400/50 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <ClockIcon className="size-3 inline-block mr-1 opacity-70" />
                      {hour}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-amber-300">
              No hay turnos disponibles para esta combinación. Probá cambiando la fecha o el deporte.
            </p>
          )}
        </div>

        {/* Court Map / List Layout */}
        <div
          className={cn(
            "relative grid gap-6",
            selectedCourt && !isMobile && "lg:grid-cols-[1fr_360px]",
          )}
        >
          <div className={cn("min-w-0", isPending && "opacity-60")}>
            {initialVista === "lista" ? (
              <PlanListView
                courts={planCourts}
                selectedCourtId={selectedCourtId}
                highlightSport={initialDeporte}
                onSelectCourt={handleSelectCourt}
              />
            ) : (
              <PlanMap
                venue={venue}
                courts={planCourts}
                mode="select"
                selectedHourLabel={initialHora ?? null}
                selectedCourtId={selectedCourtId}
                highlightSport={initialDeporte}
                onSelectCourt={handleSelectCourt}
              />
            )}
          </div>

          {/* Desktop Right Side Panel */}
          {selectedCourt && !isMobile ? (
            <aside className="flex max-h-[min(75vh,680px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-navy-950 text-white shadow-2xl">
              {panelContent}
            </aside>
          ) : null}
        </div>

        {/* Mobile Bottom Drawer for Selected Court */}
        {selectedCourt && isMobile ? (
          <Drawer open onOpenChange={(open) => !open && handleClosePanel()}>
            <DrawerContent className="max-h-[85vh] bg-navy-950 text-white border-white/15">
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
  scrollableSlots,
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
  scrollableSlots: boolean;
}) {
  const hourPrice = selectedHour
    ? courtSlotsPriceLabel(courtSlots, availableSlots, selectedHour)
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col bg-navy-950 text-white">
      {/* Panel Header */}
      <div className="shrink-0 space-y-2.5 border-b border-white/10 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-[10px] font-bold uppercase">
                {SPORT_LABELS[court.sport]}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-slate-300 text-[10px]">
                Sintético Pro
              </Badge>
            </div>
            <h3 className="mt-1 font-display text-2xl uppercase tracking-wide text-white">
              {court.name}
            </h3>
          </div>

          {showClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
              aria-label="Cerrar panel"
            >
              <XIcon className="size-5" />
            </Button>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-slate-300">
          {court.description}
        </p>

        {hourPrice ? (
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs">
            <span className="text-slate-300">Precio a las {selectedHour}:</span>
            <span className="font-bold text-lime-400 text-sm">{hourPrice}</span>
          </div>
        ) : null}
      </div>

      {/* Available Slots List */}
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Turnos Disponibles ({availableSlots.length})
          </p>
          <span className="text-[10px] text-lime-400 font-semibold">
            Confirmación inmediata
          </span>
        </div>

        {availableSlots.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 p-6 text-center">
            <ClockIcon className="size-8 text-slate-500 mb-2" />
            <p className="text-sm font-semibold text-slate-300">Sin turnos libres hoy</p>
            <p className="text-xs text-slate-500 mt-1">Probá seleccionando otra fecha en el calendario superior.</p>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col gap-2.5",
              scrollableSlots &&
                "min-h-0 flex-1 overflow-y-auto pr-1 no-scrollbar",
              !scrollableSlots && "max-h-[45vh] overflow-y-auto no-scrollbar",
            )}
          >
            {availableSlots.map((slot) => {
              const label = formatTimeLabel(slot.startsAt);
              const endLabel = formatTimeLabel(slot.endsAt);
              const isActive = activeSlot?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => onSelectSlot(slot.startsAt)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all duration-200 active:scale-[0.98]",
                    isActive
                      ? "border-lime-400 bg-lime-400/20 text-white ring-2 ring-lime-400 shadow-md shadow-lime-400/10"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-lime-400/40 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "size-3 rounded-full",
                        isActive ? "bg-lime-400 animate-pulse" : "bg-slate-500"
                      )}
                    />
                    <div>
                      <span className="font-bold text-base">{label} hs</span>
                      <span className="text-xs text-slate-400 ml-1.5">hasta {endLabel}</span>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-bold px-3 py-1",
                      isActive
                        ? "bg-lime-400 text-navy-950"
                        : "bg-white/10 text-lime-400 border border-lime-400/20"
                    )}
                  >
                    {formatArs(slot.priceArs)}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="shrink-0 border-t border-white/10 p-5 bg-navy-950">
        {activeSlot ? (
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="text-slate-300">Turno elegido:</span>
            <span className="font-bold text-white">
              {formatTimeLabel(activeSlot.startsAt)} hs • {formatArs(activeSlot.priceArs)}
            </span>
          </div>
        ) : null}

        <Button
          type="button"
          className="w-full h-12 bg-lime-400 text-sm font-bold text-navy-950 hover:bg-lime-300 shadow-lg shadow-lime-400/20 disabled:opacity-50"
          disabled={!activeSlot || isSubmitting}
          onClick={onContinue}
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin mr-2 size-5" />
              Bloqueando turno temporal…
            </>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Continuar con la Reserva</span>
              <ChevronRightIcon className="size-4" />
            </div>
          )}
        </Button>
      </div>
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
