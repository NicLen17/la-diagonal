"use client";

import { cn } from "@/lib/utils";
import type { Court, CourtAvailabilitySummary, Venue } from "@/lib/data/types";
import { SPORT_LABELS } from "@/lib/data/types";
import { formatArs } from "@/lib/services/pricing";

export type PlanMode = "preview" | "select" | "edit";

export type PlanCourtState = {
  court: Court;
  summary?: CourtAvailabilitySummary;
  selected?: boolean;
};

type PlanMapProps = {
  venue: Venue;
  courts: PlanCourtState[];
  mode?: PlanMode;
  selectedHourLabel?: string | null;
  onSelectCourt?: (courtId: string) => void;
  selectedCourtId?: string | null;
  className?: string;
};

function statusFor(
  summary: CourtAvailabilitySummary | undefined,
  selectedHourLabel: string | null | undefined,
): { label: string; tone: "available" | "occupied" | "partial" | "neutral" } {
  if (!summary) {
    return { label: "Cancha", tone: "neutral" };
  }
  if (selectedHourLabel && summary.selectedSlotAvailable !== null) {
    return summary.selectedSlotAvailable
      ? { label: "Disponible", tone: "available" }
      : { label: "Ocupada", tone: "occupied" };
  }
  if (summary.totalSlots === 0) {
    return { label: "Sin turnos", tone: "neutral" };
  }
  if (summary.freeSlots === 0) {
    return { label: "Sin cupos", tone: "occupied" };
  }
  if (summary.freeSlots === summary.totalSlots) {
    return { label: `${summary.freeSlots} libres`, tone: "available" };
  }
  return {
    label: `${summary.freeSlots}/${summary.totalSlots} libres`,
    tone: "partial",
  };
}

export function PlanMap({
  venue,
  courts,
  mode = "preview",
  selectedHourLabel,
  onSelectCourt,
  selectedCourtId,
  className,
}: PlanMapProps) {
  const aspect = venue.planWidthM / venue.planLengthM;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-navy-800/20 bg-navy-900 bg-field-lines shadow-lg",
        className,
      )}
      style={{ aspectRatio: `${aspect}` }}
      role="group"
      aria-label="Plano del predio"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-800/40 to-navy-950/60" />
      {courts.map(({ court, summary, selected }) => {
        const status = statusFor(summary, selectedHourLabel);
        const isSelected = selected || selectedCourtId === court.id;
        const left = (court.planX_m / venue.planWidthM) * 100;
        const top = (court.planY_m / venue.planLengthM) * 100;
        const width = (court.planWidthM / venue.planWidthM) * 100;
        const height = (court.planLengthM / venue.planLengthM) * 100;

        const commonClass = cn(
          "absolute flex flex-col items-center justify-center gap-0.5 rounded-md border-2 p-1 text-center transition",
          "focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none",
          status.tone === "available" &&
            "border-lime-400/80 bg-lime-400/35 text-white hover:bg-lime-400/50",
          status.tone === "occupied" &&
            "border-red-500/80 bg-red-500/40 text-white",
          status.tone === "partial" &&
            "border-amber-400/80 bg-amber-400/35 text-white hover:bg-amber-400/50",
          status.tone === "neutral" &&
            "border-white/30 bg-white/10 text-white hover:bg-white/20",
          isSelected && "ring-2 ring-lime-400 ring-offset-2 ring-offset-navy-900",
          mode === "preview" && "pointer-events-none",
        );

        const label = `${court.name}, ${SPORT_LABELS[court.sport]}, ${status.label}${
          summary ? `, desde ${formatArs(court.basePriceArs)}` : ""
        }`;

        const style = {
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
          transform: court.planRotationDeg
            ? `rotate(${court.planRotationDeg}deg)`
            : undefined,
        } as const;

        if (mode === "select" || mode === "edit") {
          return (
            <button
              key={court.id}
              type="button"
              className={commonClass}
              style={style}
              aria-label={label}
              aria-pressed={isSelected}
              onClick={() => onSelectCourt?.(court.id)}
            >
              <span className="font-display text-[10px] leading-tight uppercase sm:text-xs">
                {court.name}
              </span>
              <span className="text-[9px] opacity-90 sm:text-[10px]">
                {status.label}
              </span>
            </button>
          );
        }

        return (
          <div key={court.id} className={commonClass} style={style} aria-label={label}>
            <span className="font-display text-[10px] leading-tight uppercase sm:text-xs">
              {court.name}
            </span>
            <span className="text-[9px] opacity-90 sm:text-[10px]">
              {SPORT_LABELS[court.sport]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PlanListView({
  courts,
  onSelectCourt,
  selectedCourtId,
}: {
  courts: PlanCourtState[];
  onSelectCourt?: (courtId: string) => void;
  selectedCourtId?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Cancha</th>
            <th className="px-3 py-2 font-medium">Deporte</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 font-medium">Precio base</th>
          </tr>
        </thead>
        <tbody>
          {courts.map(({ court, summary }) => {
            const status = statusFor(summary, null);
            return (
              <tr
                key={court.id}
                className={cn(
                  "border-t cursor-pointer hover:bg-accent/40",
                  selectedCourtId === court.id && "bg-accent",
                )}
                onClick={() => onSelectCourt?.(court.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectCourt?.(court.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Seleccionar ${court.name}`}
              >
                <td className="px-3 py-2 font-medium">{court.name}</td>
                <td className="px-3 py-2">{SPORT_LABELS[court.sport]}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      status.tone === "available" && "bg-lime-400/20 text-navy-900",
                      status.tone === "occupied" && "bg-red-100 text-red-700",
                      status.tone === "partial" && "bg-amber-100 text-amber-800",
                      status.tone === "neutral" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-3 py-2">{formatArs(court.basePriceArs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
