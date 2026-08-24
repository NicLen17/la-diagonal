# ADR 0002 — Derived slots

## Status

Accepted

## Context

Courts have different slot durations (60 vs 90 minutes). Storing every slot row would explode and drift from opening hours.

## Decision

Persist venue hour templates and court duration. Derive slots at read time in `availability.ts`.

## Alternatives

- Fixed global slot list: simpler but wrong for pádel.
- Per-sport templates: more admin UI, little gain over duration + venue hours.
- Free-range booking: harder availability coloring on the map.

## Consequences

One pure function powers map, list, and admin previews. Closures and reservations are the only blockers.
