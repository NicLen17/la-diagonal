# ADR 0004 — Guest-first identity

## Status

Accepted

## Context

Friction kills sports bookings. WhatsApp is the confirmation channel.

## Decision

Customers book as guests (name, email, phone). Optional magic link later. "Mis reservas" lookup by code + phone. Admin uses a temporary passcode cookie until Supabase Auth.

## Alternatives

- Required email/password: higher drop-off.
- Phone OTP: needs SMS provider.
- Guest-only forever: no loyalty / history UX.

## Consequences

`Customer` ≠ `User` in the glossary. Schema keeps `auth_user_id` nullable on customers.
