# La Diagonal — Domain Glossary

Canonical terms for the Complejo Deportivo La Diagonal booking platform. No implementation details.

## Core entities

- **Venue (Sede)**: A physical sports complex with its own dimensions, opening hours, and bank/payment details. The product is multi-venue ready; the UI currently surfaces one venue.
- **Court (Cancha)**: A playable surface inside a Venue. Has a sport, slot duration, base price, description, and a rectangle on the venue plan (position and size in meters).
- **Sport (Deporte)**: The activity assigned to a Court (e.g. fútbol 5, fútbol 7, fútbol 9, fútbol 11, futsal, handball, pádel).
- **Slot (Turno)**: A derived time interval for a Court on a given date. Never persisted. Produced from the Venue's hour template and the Court's slot duration.
- **Reservation (Reserva)**: An intent to occupy a Court for a Slot. The only entity that blocks availability (alongside Closures).
- **Hold**: A short-lived Reservation status that already blocks the Slot while the Customer finishes the booking form.
- **Closure (Cierre)**: An administrative block (maintenance, tournament, event) that occupies a Court or Venue without being a Reservation.
- **Price Rule (Regla de precio)**: A surcharge or alternate price that applies to a time range and/or weekdays, resolved by priority over the Court's base price.
- **Customer (Reservante)**: The person booking. Exists with name, email, and phone only. Does not require an account.
- **User**: An authenticated identity (admin or optional magic-link Customer). Distinct from Customer.
- **Receipt (Comprobante)**: Proof of bank transfer attached to a Reservation when the payment method requires it.

## Reservation lifecycle

`hold` → `pending` → `confirmed` | `cancelled` | `expired`

- **hold**: Blocks the Slot for a short TTL (15 minutes) while the Customer completes data and payment choice.
- **pending**: Blocks the Slot indefinitely until staff validates payment / booking.
- **confirmed**: Validated by staff. Blocks the Slot.
- **cancelled**: Explicitly cancelled. Slot is free.
- **expired**: Hold that outlived its TTL. Slot is free.

## Payment methods

- **cash (efectivo)**: Pay on site. No receipt required.
- **deposit (seña)**: Percentage of total paid by transfer before the match; remainder on site. Receipt required.
- **transfer_full**: Full amount paid by transfer. Receipt required.

## Plan coordinates

Court geometry on the venue map is expressed in meters relative to the Venue's width and length. The renderer converts meters to percentages via the Venue's aspect ratio.
