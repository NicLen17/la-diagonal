# ADR 0003 — Hold + exclusion constraint

## Status

Accepted

## Context

Payments are offline (cash / transfer). Two users can race for the same slot. Pending bookings must not leave zombie holds forever.

## Decision

`hold` (15 min TTL) blocks immediately. Statuses `hold|pending|confirmed` participate in a Postgres `EXCLUDE USING gist` on `tstzrange`. `pg_cron` expires holds.

## Alternatives

- Only confirmed blocks: allows overbooking.
- Pending blocks forever: requires manual cleanup for abandoned carts.
- Application-only locks: race conditions under load.

## Consequences

Mock mirrors the rule in memory. Production integrity is in the database.
