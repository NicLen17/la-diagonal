# ADR 0005 — Custom pointer map builder

## Status

Accepted

## Context

Admin needs a simple venue plan editor (rectangles in meters). Off-the-shelf DnD libraries struggle with React 19 and keyboard resize.

## Decision

Implement `use-draggable-rect` with pointer events, 0.5m snap, keyboard nudge, and a numeric inspector as the accessible path.

## Alternatives

- react-rnd / dnd-kit: heavier, weak keyboard story.
- Fabric.js / Konva: overkill for rectangles.

## Consequences

~150 lines of controlled code. Same renderer serves edit / select / preview modes.
