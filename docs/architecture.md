# Architecture

## Stack

- Next.js 16 App Router (Server Components + Server Actions)
- Tailwind CSS v4 + shadcn/ui (radix-nova)
- Motion (`motion/react`) for state-driven animation only
- Zod validation, date-fns, libphonenumber-js
- Data: mock repository today; Supabase tomorrow

## Layers

```
app/                  # routes, layouts, loading/error boundaries
components/           # UI (landing, map, booking, admin)
lib/services/         # pure business logic (availability, pricing, whatsapp)
lib/data/             # ports + adapters (mock | supabase)
```

Server Actions call `lib/services/*`, which call repositories through ports in `lib/data/ports.ts`. UI never talks to the store directly.

## Mock → Supabase migration

1. Keep `types.ts`, `schemas.ts`, `ports.ts`, and all of `lib/services/*` unchanged.
2. Add `lib/data/supabase/` implementing the same ports.
3. Switch `lib/data/index.ts` via `DATA_ADAPTER=supabase`.
4. Apply `docs/schema.sql` and generate `Database` types.

## Booking state in the URL

`/reservar?fecha=&deporte=&hora=&cancha=` is the source of truth for the booking map. Sharing a link shares the exact view; the Server Component can resolve availability before paint.

## Admin auth (phase 1)

Middleware checks an httpOnly cookie signed with `ADMIN_PASSCODE`. Placeholder until Supabase Auth + `profiles.role`.

## Anti double-booking

Mock layer checks overlaps in memory. Production uses Postgres `EXCLUDE USING gist` on `tstzrange` (see schema). Holds expire via `pg_cron`.
