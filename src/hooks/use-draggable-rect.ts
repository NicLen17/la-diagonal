"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

export type RectMeters = {
  x: number;
  y: number;
  width: number;
  length: number;
  rotation: number;
};

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

type DragMode = "move" | "resize" | null;

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resizeFromCorner(
  start: RectMeters,
  dx: number,
  dy: number,
  corner: ResizeCorner,
  minWidth: number,
  minLength: number,
  venueWidthM: number,
  venueLengthM: number,
): RectMeters {
  const right = start.x + start.width;
  const bottom = start.y + start.length;
  const growsEast = corner === "ne" || corner === "se";
  const growsSouth = corner === "se" || corner === "sw";

  let x = start.x;
  let y = start.y;
  let width = start.width;
  let length = start.length;

  if (growsEast) {
    width = clamp(start.width + dx, minWidth, venueWidthM - start.x);
  } else {
    x = clamp(start.x + dx, 0, right - minWidth);
    width = right - x;
  }

  if (growsSouth) {
    length = clamp(start.length + dy, minLength, venueLengthM - start.y);
  } else {
    y = clamp(start.y + dy, 0, bottom - minLength);
    length = bottom - y;
  }

  return { x, y, width, length, rotation: start.rotation };
}

type UseDraggableRectOptions = {
  rect: RectMeters;
  onChange: (rect: RectMeters) => void;
  venueWidthM: number;
  venueLengthM: number;
  minWidth?: number;
  minLength?: number;
  snapStep?: number;
  keyboardEnabled?: boolean;
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
  keyboardEnabled = true,
  containerRef,
}: UseDraggableRectOptions) {
  const modeRef = useRef<DragMode>(null);
  const cornerRef = useRef<ResizeCorner>("se");
  const startRef = useRef({ x: 0, y: 0, rect: rect });
  const rectRef = useRef(rect);
  const applyMoveRef = useRef<(clientX: number, clientY: number) => void>(
    () => {},
  );

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

  const capturedRef = useRef<{ el: Element; pointerId: number } | null>(null);

  useEffect(() => {
    applyMoveRef.current = (clientX: number, clientY: number) => {
      if (!modeRef.current) return;
      const start = startRef.current;
      const startM = pointerToMeters(start.x, start.y);
      const currentM = pointerToMeters(clientX, clientY);
      const dx = currentM.x - startM.x;
      const dy = currentM.y - startM.y;

      if (modeRef.current === "move") {
        applyRect({
          ...start.rect,
          x: start.rect.x + dx,
          y: start.rect.y + dy,
        });
        return;
      }

      applyRect(
        resizeFromCorner(
          start.rect,
          dx,
          dy,
          cornerRef.current,
          minWidth,
          minLength,
          venueWidthM,
          venueLengthM,
        ),
      );
    };
  }, [applyRect, minLength, minWidth, pointerToMeters, venueLengthM, venueWidthM]);

  const beginDrag = useCallback((e: React.PointerEvent, mode: DragMode, corner?: ResizeCorner) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      capturedRef.current = { el: e.currentTarget, pointerId: e.pointerId };
    } catch {
      capturedRef.current = null;
    }
    modeRef.current = mode;
    if (corner) cornerRef.current = corner;
    startRef.current = { x: e.clientX, y: e.clientY, rect: { ...rectRef.current } };
  }, []);

  const onPointerDownMove = useCallback(
    (e: React.PointerEvent) => {
      beginDrag(e, "move");
    },
    [beginDrag],
  );

  const onPointerDownResize = useCallback(
    (e: React.PointerEvent, corner: ResizeCorner) => {
      beginDrag(e, "resize", corner);
    },
    [beginDrag],
  );

  const endDrag = useCallback(() => {
    const captured = capturedRef.current;
    if (captured) {
      try {
        captured.el.releasePointerCapture(captured.pointerId);
      } catch {
        // Capture may already have been released.
      }
      capturedRef.current = null;
    }
    modeRef.current = null;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    applyMoveRef.current(e.clientX, e.clientY);
  }, []);

  const onPointerUp = endDrag;

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      applyMoveRef.current(e.clientX, e.clientY);
    };
    const handleUp = () => {
      endDrag();
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [endDrag]);

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
    if (!keyboardEnabled) return;

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
  }, [keyboardEnabled, nudge]);

  return {
    onPointerDownMove,
    onPointerDownResize,
    onPointerMove,
    onPointerUp,
    nudge,
  };
}
