"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

export type RectMeters = {
  x: number;
  y: number;
  width: number;
  length: number;
  rotation: number;
};

type DragMode = "move" | "resize" | null;

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type UseDraggableRectOptions = {
  rect: RectMeters;
  onChange: (rect: RectMeters) => void;
  venueWidthM: number;
  venueLengthM: number;
  minWidth?: number;
  minLength?: number;
  snapStep?: number;
  enabled?: boolean;
  containerRef: RefObject<HTMLElement | null>;
};

export function useDraggableRect({
  rect,
  onChange,
  venueWidthM,
  venueLengthM,
  minWidth = 4,
  minLength = 4,
  snapStep = 0.5,
  enabled = true,
  containerRef,
}: UseDraggableRectOptions) {
  const modeRef = useRef<DragMode>(null);
  const startRef = useRef({ x: 0, y: 0, rect: rect });
  const rectRef = useRef(rect);

  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  const applyRect = useCallback(
    (next: RectMeters) => {
      const snapped: RectMeters = {
        x: snap(clamp(next.x, 0, venueWidthM - minWidth), snapStep),
        y: snap(clamp(next.y, 0, venueLengthM - minLength), snapStep),
        width: snap(clamp(next.width, minWidth, venueWidthM), snapStep),
        length: snap(clamp(next.length, minLength, venueLengthM), snapStep),
        rotation: next.rotation,
      };
      snapped.x = clamp(snapped.x, 0, venueWidthM - snapped.width);
      snapped.y = clamp(snapped.y, 0, venueLengthM - snapped.length);
      onChange(snapped);
    },
    [minLength, minWidth, onChange, snapStep, venueLengthM, venueWidthM],
  );

  const pointerToMeters = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return { x: 0, y: 0 };
      const bounds = el.getBoundingClientRect();
      const relX = (clientX - bounds.left) / bounds.width;
      const relY = (clientY - bounds.top) / bounds.height;
      return {
        x: relX * venueWidthM,
        y: relY * venueLengthM,
      };
    },
    [containerRef, venueLengthM, venueWidthM],
  );

  const onPointerDownMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      modeRef.current = "move";
      startRef.current = { x: e.clientX, y: e.clientY, rect: { ...rectRef.current } };
    },
    [enabled],
  );

  const onPointerDownResize = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      modeRef.current = "resize";
      startRef.current = { x: e.clientX, y: e.clientY, rect: { ...rectRef.current } };
    },
    [enabled],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!modeRef.current) return;
      const start = startRef.current;
      const startM = pointerToMeters(start.x, start.y);
      const currentM = pointerToMeters(e.clientX, e.clientY);
      const dx = currentM.x - startM.x;
      const dy = currentM.y - startM.y;

      if (modeRef.current === "move") {
        applyRect({
          ...start.rect,
          x: start.rect.x + dx,
          y: start.rect.y + dy,
        });
      } else if (modeRef.current === "resize") {
        applyRect({
          ...start.rect,
          width: start.rect.width + dx,
          length: start.rect.length + dy,
        });
      }
    },
    [applyRect, pointerToMeters],
  );

  const onPointerUp = useCallback(() => {
    modeRef.current = null;
  }, []);

  const nudge = useCallback(
    (dx: number, dy: number) => {
      applyRect({
        ...rectRef.current,
        x: rectRef.current.x + dx,
        y: rectRef.current.y + dy,
      });
    },
    [applyRect],
  );

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.1 : 1;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          nudge(-step, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          nudge(step, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          nudge(0, -step);
          break;
        case "ArrowDown":
          e.preventDefault();
          nudge(0, step);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, nudge]);

  return {
    onPointerDownMove,
    onPointerDownResize,
    onPointerMove,
    onPointerUp,
    nudge,
  };
}
