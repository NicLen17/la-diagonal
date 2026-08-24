# ADR 0001 — Mock data adapter

## Status

Accepted

## Context

We need a working booking product before Supabase is provisioned. The UI and business rules must not be rewritten later.

## Decision

Expose repositories behind ports in `lib/data/ports.ts`. Ship a mock adapter with in-memory seed data. Swap via `DATA_ADAPTER`.

## Alternatives

- localStorage / Zustand: breaks Server Components and shared availability.
- File-backed JSON: works but complicates serverless deploys.
- Supabase from day one: blocks demo until credentials exist.

## Consequences

Services stay pure. Migrating means one new adapter folder.
