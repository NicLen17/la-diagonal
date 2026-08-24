"use client";

import { useCallback, useRef, useState, useTransition, type RefObject } from "react";
import { toast } from "sonner";
import type { Court, Sport, Venue } from "@/lib/data/types";
import { SPORT_LABELS } from "@/lib/data/types";
import {
  deleteCourt,
  updateCourtPlan,
  updateVenueConfig,
  upsertCourt,
} from "@/lib/services/admin-actions";
import { formatArs } from "@/lib/services/pricing";
import { useDraggableRect, type RectMeters } from "@/hooks/use-draggable-rect";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type DraftCourt = {
  id?: string;
  name: string;
  sport: Sport;
  description: string;
  surface: Court["surface"];
  hasLights: boolean;
  slotDurationMinutes: number;
  basePriceArs: number;
  sortOrder: number;
  isActive: boolean;
  plan: RectMeters;
};

function courtToDraft(court: Court): DraftCourt {
  return {
    id: court.id,
    name: court.name,
    sport: court.sport,
    description: court.description,
    surface: court.surface,
    hasLights: court.hasLights,
    slotDurationMinutes: court.slotDurationMinutes,
    basePriceArs: court.basePriceArs,
    sortOrder: court.sortOrder,
    isActive: court.isActive,
    plan: {
      x: court.planX_m,
      y: court.planY_m,
      width: court.planWidthM,
      length: court.planLengthM,
      rotation: court.planRotationDeg,
    },
  };
}

function newDraftCourt(venue: Venue, courts: Court[]): DraftCourt {
  return {
    name: `Cancha ${courts.length + 1}`,
    sport: "futbol_5",
    description: "",
    surface: "cesped_sintetico",
    hasLights: true,
    slotDurationMinutes: 60,
    basePriceArs: 18000,
    sortOrder: courts.length + 1,
    isActive: true,
    plan: { x: 2, y: 2, width: 20, length: 14, rotation: 0 },
  };
}

function EditableCourtRect({
  draft,
  venue,
  selected,
  mapContainerRef,
  onSelect,
  onPlanChange,
}: {
  draft: DraftCourt;
  venue: Venue;
  selected: boolean;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onPlanChange: (plan: RectMeters) => void;
}) {
  const { onPointerDownMove, onPointerDownResize, onPointerMove, onPointerUp } =
    useDraggableRect({
      rect: draft.plan,
      onChange: onPlanChange,
      venueWidthM: venue.planWidthM,
      venueLengthM: venue.planLengthM,
      enabled: selected,
      containerRef: mapContainerRef,
    });

  const left = (draft.plan.x / venue.planWidthM) * 100;
  const top = (draft.plan.y / venue.planLengthM) * 100;
  const width = (draft.plan.width / venue.planWidthM) * 100;
  const height = (draft.plan.length / venue.planLengthM) * 100;

  return (
    <div
      className={cn(
        "absolute flex touch-none flex-col items-center justify-center rounded-md border-2 p-1 text-center text-white transition",
        selected
          ? "border-lime-400 bg-lime-400/40 ring-2 ring-lime-400 ring-offset-2 ring-offset-navy-900"
          : "border-white/40 bg-white/15 hover:bg-white/25",
      )}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        transform: draft.plan.rotation
          ? `rotate(${draft.plan.rotation}deg)`
          : undefined,
      }}
      onPointerDown={(e) => {
        onSelect();
        onPointerDownMove(e);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      tabIndex={selected ? 0 : -1}
      role="button"
      aria-label={draft.name}
      aria-pressed={selected}
    >
      <span className="pointer-events-none font-display text-[10px] uppercase sm:text-xs">
        {draft.name}
      </span>
      {selected && (
        <span
          className="absolute right-0 bottom-0 size-4 cursor-se-resize rounded-sm border border-lime-400 bg-lime-400"
          onPointerDown={onPointerDownResize}
          aria-label="Redimensionar"
        />
      )}
    </div>
  );
}

export function MapBuilder({
  venue,
  courts,
}: {
  venue: Venue;
  courts: Court[];
}) {
  const [planWidthM, setPlanWidthM] = useState(venue.planWidthM);
  const [planLengthM, setPlanLengthM] = useState(venue.planLengthM);
  const [drafts, setDrafts] = useState<DraftCourt[]>(() =>
    courts.map(courtToDraft),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    courts[0]?.id ?? null,
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();

  const selectedDraft =
    drafts.find((d) => (d.id ?? "new") === (selectedId ?? "new")) ??
    drafts[0] ??
    null;

  const updateSelected = useCallback(
    (patch: Partial<DraftCourt>) => {
      if (!selectedDraft) return;
      const key = selectedDraft.id ?? "new";
      setDrafts((prev) =>
        prev.map((d) =>
          (d.id ?? "new") === key ? { ...d, ...patch } : d,
        ),
      );
    },
    [selectedDraft],
  );

  const updateSelectedPlan = useCallback(
    (plan: RectMeters) => {
      updateSelected({ plan });
    },
    [updateSelected],
  );

  function saveVenueDimensions() {
    startTransition(async () => {
      try {
        await updateVenueConfig({
          depositPercent: venue.depositPercent,
          bankAlias: venue.bankAlias,
          bankCbu: venue.bankCbu,
          bankHolder: venue.bankHolder,
          whatsappE164: venue.whatsappE164,
          planWidthM,
          planLengthM,
        });
        toast.success("Dimensiones del plano actualizadas");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar",
        );
      }
    });
  }

  function addCourt() {
    const draft = newDraftCourt(
      { ...venue, planWidthM, planLengthM },
      courts,
    );
    const tempId = `temp-${Date.now()}`;
    setDrafts((prev) => [...prev, { ...draft, id: tempId }]);
    setSelectedId(tempId);
  }

  function saveCourt() {
    if (!selectedDraft) return;
    startTransition(async () => {
      try {
        const isTemp = selectedDraft.id?.startsWith("temp-");
        const saved = await upsertCourt({
          id: isTemp ? undefined : selectedDraft.id,
          name: selectedDraft.name,
          sport: selectedDraft.sport,
          description: selectedDraft.description,
          surface: selectedDraft.surface,
          hasLights: selectedDraft.hasLights,
          slotDurationMinutes: selectedDraft.slotDurationMinutes,
          basePriceArs: selectedDraft.basePriceArs,
          planX_m: selectedDraft.plan.x,
          planY_m: selectedDraft.plan.y,
          planWidthM: selectedDraft.plan.width,
          planLengthM: selectedDraft.plan.length,
          planRotationDeg: selectedDraft.plan.rotation,
          sortOrder: selectedDraft.sortOrder,
          isActive: selectedDraft.isActive,
        });
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === selectedDraft.id ? courtToDraft(saved) : d,
          ),
        );
        setSelectedId(saved.id);
        toast.success("Cancha guardada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar cancha",
        );
      }
    });
  }

  function savePlanOnly() {
    if (!selectedDraft?.id || selectedDraft.id.startsWith("temp-")) {
      saveCourt();
      return;
    }
    startTransition(async () => {
      try {
        await updateCourtPlan(selectedDraft.id!, {
          planX_m: selectedDraft.plan.x,
          planY_m: selectedDraft.plan.y,
          planWidthM: selectedDraft.plan.width,
          planLengthM: selectedDraft.plan.length,
          planRotationDeg: selectedDraft.plan.rotation,
        });
        toast.success("Posición guardada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar posición",
        );
      }
    });
  }

  function removeCourt() {
    if (!selectedDraft?.id) return;
    if (selectedDraft.id.startsWith("temp-")) {
      setDrafts((prev) => prev.filter((d) => d.id !== selectedDraft.id));
      setSelectedId(drafts[0]?.id ?? null);
      return;
    }
    startTransition(async () => {
      try {
        await deleteCourt(selectedDraft.id!);
        setDrafts((prev) => prev.filter((d) => d.id !== selectedDraft.id));
        setSelectedId(null);
        toast.success("Cancha eliminada");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al eliminar",
        );
      }
    });
  }

  const aspect = planWidthM / planLengthM;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Dimensiones del predio</CardTitle>
            <CardDescription>
              Tamaño del plano en metros (mismo sistema que el mapa público)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="planWidth">Ancho (m)</Label>
              <Input
                id="planWidth"
                type="number"
                min={10}
                step={0.5}
                value={planWidthM}
                onChange={(e) => setPlanWidthM(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="planLength">Largo (m)</Label>
              <Input
                id="planLength"
                type="number"
                min={10}
                step={0.5}
                value={planLengthM}
                onChange={(e) => setPlanLengthM(Number(e.target.value))}
              />
            </div>
            <Button onClick={saveVenueDimensions} disabled={pending}>
              Guardar dimensiones
            </Button>
          </CardContent>
        </Card>

        <div
          ref={mapContainerRef}
          className="relative w-full overflow-hidden rounded-2xl border border-navy-800/20 bg-navy-900 bg-field-lines shadow-lg"
          style={{ aspectRatio: `${aspect}` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-navy-800/40 to-navy-950/60" />
          {drafts.map((draft) => (
            <EditableCourtRect
              key={draft.id ?? draft.name}
              draft={draft}
              venue={{ ...venue, planWidthM, planLengthM }}
              mapContainerRef={mapContainerRef as RefObject<HTMLDivElement | null>}
              selected={(draft.id ?? "new") === (selectedId ?? "new")}
              onSelect={() => setSelectedId(draft.id ?? null)}
              onPlanChange={(plan) => {
                const key = draft.id ?? "new";
                setDrafts((prev) =>
                  prev.map((d) =>
                    (d.id ?? "new") === key ? { ...d, plan } : d,
                  ),
                );
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={addCourt}>
            Agregar cancha
          </Button>
          <Button variant="outline" onClick={savePlanOnly} disabled={pending}>
            Guardar posición
          </Button>
        </div>
      </div>

      <Card className="h-fit xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>Inspector</CardTitle>
          <CardDescription>
            Editá propiedades y posición (flechas: 1 m, Shift: 0,1 m)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedDraft ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>X (m)</Label>
                  <Input
                    type="number"
                    step={0.5}
                    value={selectedDraft.plan.x}
                    onChange={(e) =>
                      updateSelectedPlan({
                        ...selectedDraft.plan,
                        x: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Y (m)</Label>
                  <Input
                    type="number"
                    step={0.5}
                    value={selectedDraft.plan.y}
                    onChange={(e) =>
                      updateSelectedPlan({
                        ...selectedDraft.plan,
                        y: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Ancho (m)</Label>
                  <Input
                    type="number"
                    step={0.5}
                    value={selectedDraft.plan.width}
                    onChange={(e) =>
                      updateSelectedPlan({
                        ...selectedDraft.plan,
                        width: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Largo (m)</Label>
                  <Input
                    type="number"
                    step={0.5}
                    value={selectedDraft.plan.length}
                    onChange={(e) =>
                      updateSelectedPlan({
                        ...selectedDraft.plan,
                        length: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Rotación (°)</Label>
                  <Input
                    type="number"
                    value={selectedDraft.plan.rotation}
                    onChange={(e) =>
                      updateSelectedPlan({
                        ...selectedDraft.plan,
                        rotation: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input
                  value={selectedDraft.name}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Deporte</Label>
                <Select
                  value={selectedDraft.sport}
                  onValueChange={(v) =>
                    updateSelected({ sport: v as Sport })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SPORT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Descripción</Label>
                <Textarea
                  value={selectedDraft.description}
                  onChange={(e) =>
                    updateSelected({ description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <Label>Precio base ({formatArs(selectedDraft.basePriceArs)})</Label>
                <Input
                  type="number"
                  value={selectedDraft.basePriceArs}
                  onChange={(e) =>
                    updateSelected({ basePriceArs: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Duración turno (min)</Label>
                <Input
                  type="number"
                  value={selectedDraft.slotDurationMinutes}
                  onChange={(e) =>
                    updateSelected({
                      slotDurationMinutes: Number(e.target.value),
                    })
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedDraft.isActive}
                  onCheckedChange={(v) =>
                    updateSelected({ isActive: v === true })
                  }
                />
                Cancha activa
              </label>

              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={saveCourt} disabled={pending}>
                  Guardar cancha
                </Button>
                <Button
                  variant="destructive"
                  onClick={removeCourt}
                  disabled={pending}
                >
                  Eliminar
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Seleccioná una cancha en el mapa o agregá una nueva
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
