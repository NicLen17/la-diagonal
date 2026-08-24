# PRD — La Diagonal Booking Platform

**Versión:** 1.0  
**Fecha:** agosto 2026  
**Estado:** MVP en desarrollo / piloto La Diagonal  
**Owner:** Producto La Diagonal Booking Platform

---

## 1. Resumen

La Diagonal Booking Platform es un SaaS vertical para complejos deportivos que permite a los jugadores reservar canchas mediante un **mapa interactivo del predio** y a los operadores gestionar disponibilidad, precios, horarios y reservas desde un panel de administración.

El producto se lanza primero con el Complejo La Diagonal (Tafí Viejo, Tucumán) como cliente piloto y design partner, con arquitectura multi-sede preparada para escalar a redes como `reddecomplejos`.

---

## 2. Problema

Los complejos deportivos en Argentina gestionan reservas principalmente por WhatsApp y cuaderno. Esto genera:

- **Doble booking** cuando varios clientes consultan el mismo turno simultáneamente.
- **Fricción operativa** en validación de señas y comprobantes de transferencia.
- **Baja visibilidad digital** — quien no conoce el número no reserva.
- **Precios variables** (día/noche, fin de semana) difíciles de comunicar en tiempo real.
- **Ausencia de una vista espacial** — el cliente no elige “cancha 3 en el mapa”, sino que pregunta “¿está libre?”.

---

## 3. Objetivos

### Objetivos de producto (MVP)

| # | Objetivo | Métrica de éxito |
|---|----------|------------------|
| O1 | Permitir reserva completa sin login | ≥ 60% conversión hold → pending |
| O2 | Reducir consultas de disponibilidad | ≥ 5 reservas web/semana sostenidas en piloto |
| O3 | Evitar doble booking en flujo web | 0 incidentes atribuibles al sistema |
| O4 | Centralizar operación admin | Admin usado ≥ 5 días/semana |
| O5 | Landing como activo de adquisición | LCP < 2.0s en 4G; presencia en Google |

### Objetivos de negocio (post-MVP)

| # | Objetivo | Métrica |
|---|----------|---------|
| B1 | Validar disposición a pagar | Dueño confirma intención de suscripción post-piloto |
| B2 | Primer cliente pagador externo | 1 contrato en mes 3 post-lanzamiento |
| B3 | Case study reutilizable | Testimonial + métricas de La Diagonal |

---

## 4. No objetivos (out of scope — Fase 1–2)

- Login obligatorio para reservantes
- Gateway de pago integrado (Mercado Pago, etc.)
- App móvil nativa
- Marketplace / red de jugadores tipo Playtomic
- Multi-sede visible en UI pública (schema sí, UI no)
- Notificaciones SMS / push
- Módulo de torneos, escuelita o facturación AFIP
- Magic link completo para “Mis reservas” (stub aceptable)

---

## 5. Personas

### P1 — Jugador / reservante (usuario final)

- **Quién:** Grupo de amigos, equipo de fútbol, pareja de pádel. 25–45 años. Tucumán y regiones.
- **Comportamiento:** Prefiere WhatsApp; tolera web si es rápido y claro. No quiere crear cuenta.
- **Necesidad:** Ver si hay turno, reservar en minutos, saber precio y cómo pagar.
- **Frustración:** “Le escribí y ya estaba ocupado”, “no sé cuánto sale a las 21”.

### P2 — Administrador de sede

- **Quién:** Encargado o dueño del complejo. Confirma reservas y valida señas.
- **Comportamiento:** Usa celular y WhatsApp todo el día. Poco tiempo para capacitación.
- **Necesidad:** Ver reservas del día, confirmar/cancelar, revisar comprobante, cerrar cancha por mantenimiento.
- **Frustración:** Screenshots perdidos, doble booking, no saber quién pagó.

### P3 — Dueño / decisor comercial

- **Quién:** Propietario del complejo o de la red. Evalúa ROI del software.
- **Necesidad:** Ocupación, ingresos, menos caos operativo, presencia digital profesional.
- **Frustración:** “Probamos una app y nadie la usó”.

---

## 6. User stories y requisitos funcionales

### 6.1 Landing (`/`)

| ID | User story | Prioridad | Criterios de aceptación |
|----|------------|-----------|-------------------------|
| L-01 | Como visitante quiero entender qué es el complejo | P0 | Hero con foto, título Anton, CTAs reservar + WhatsApp |
| L-02 | Como visitante quiero ver deportes disponibles | P0 | Grid deportes con link a `/reservar?deporte=` |
| L-03 | Como visitante quiero saber cómo reservar | P1 | Stepper 4 pasos con animación scroll |
| L-04 | Como visitante quiero ver el mapa antes de reservar | P1 | Preview readonly del plan renderer |
| L-05 | Como visitante quiero contactar / ubicar | P0 | Dirección, teléfono, mapa embed diferido, redes |
| L-06 | Como buscador Google quiero rich results | P1 | Metadata, Open Graph, JSON-LD `SportsActivityLocation` |

### 6.2 Reservas (`/reservar`, `/reservar/confirmar`)

| ID | User story | Prioridad | Criterios de aceptación |
|----|------------|-----------|-------------------------|
| R-01 | Como jugador quiero ver canchas en un mapa | P0 | Renderer metros→%, aspect-ratio del predio |
| R-02 | Como jugador quiero filtrar por fecha, deporte, hora | P0 | Estado en URL; link compartible |
| R-03 | Como jugador quiero ver disponibilidad clara | P0 | Sin hora: “X de Y turnos libres”; con hora: verde/rojo |
| R-04 | Como jugador quiero reservar sin cuenta | P0 | Flujo guest: hold → datos → pago |
| R-05 | Como jugador quiero que me bloqueen el turno mientras completo | P0 | Hold 15 min; status `hold` bloquea slot |
| R-06 | Como jugador quiero elegir forma de pago | P0 | Efectivo / seña % / transferencia total |
| R-07 | Como jugador quiero adjuntar comprobante si aplica | P0 | Upload validado; solo nombre en mock |
| R-08 | Como jugador quiero accesibilidad en el mapa | P1 | Botones con aria-label; toggle lista alternativa |
| R-09 | Como jugador quiero ver precio resuelto | P0 | `resolvePrice()` con reglas por franja/día |
| R-10 | Como jugador quiero transición fluida al detalle | P2 | `layoutId` Motion en panel de cancha |

**Estado URL canónico:** `?fecha=YYYY-MM-DD&deporte=&hora=HH:mm&cancha=id`

### 6.3 Confirmación y WhatsApp

| ID | User story | Prioridad | Criterios de aceptación |
|----|------------|-----------|-------------------------|
| W-01 | Como jugador quiero ver mi código de reserva | P0 | Página `/reserva/[code]` con resumen |
| W-02 | Como jugador quiero enviar resumen por WhatsApp | P0 | Link `wa.me` con mensaje prearmado (*negrita*) |
| W-03 | Como jugador quiero consultar mi reserva después | P1 | `/mis-reservas` código + teléfono |

### 6.4 Administración

| ID | User story | Prioridad | Criterios de aceptación |
|----|------------|-----------|-------------------------|
| A-01 | Como admin quiero acceso protegido | P0 | Middleware passcode + cookie httpOnly |
| A-02 | Como admin quiero ver KPIs | P1 | Ingresos, ocupación, pico, pendientes |
| A-03 | Como admin quiero construir el mapa | P0 | Drag, resize, snap 0.5m, inspector numérico |
| A-04 | Como admin quiero CRUD de canchas | P0 | Deporte, precio base, duración turno, geometría |
| A-05 | Como admin quiero gestionar reservas | P0 | Filtros, confirmar, cancelar, ver comprobante |
| A-06 | Como admin quiero plantillas horarias | P1 | Por día de semana + overrides por cancha |
| A-07 | Como admin quiero cierres puntuales | P1 | Mantenimiento, torneo, rango fechas |
| A-08 | Como admin quiero reglas de precio | P1 | Prioridad + preview grilla en vivo |
| A-09 | Como admin quiero configurar sede | P0 | Seña %, alias, CBU, titular, WhatsApp |
| A-10 | Como admin quiero feedback instantáneo | P1 | `useOptimistic` + toasts sonner |

### 6.5 Builder del mapa (núcleo admin)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| B-01 | Ingreso ancho/largo predio en metros | P0 |
| B-02 | Contenedor `aspect-ratio` responsive | P0 |
| B-03 | Rectángulos drag con pointer events (`use-draggable-rect`) | P0 |
| B-04 | Resize por handles; snap 0.5 m | P0 |
| B-05 | Nudge teclado: 1 m (0.1 m con Shift) | P1 |
| B-06 | Inspector: x, y, ancho, largo, rotación, nombre, deporte, precio | P0 |
| B-07 | Mismo renderer en builder / reservas / landing | P0 |

---

## 7. Modelo de dominio (resumen)

Ver [`CONTEXT.md`](../../CONTEXT.md) para glosario completo.

| Entidad | Descripción |
|---------|-------------|
| **Venue** | Sede física con dimensiones, horarios, datos bancarios |
| **Court** | Cancha con deporte, duración turno, precio base, rectángulo en plano |
| **Slot** | Turno derivado (no persistido) |
| **Reservation** | Intención de ocupar cancha; bloquea disponibilidad |
| **Hold** | Reserva temporal 15 min |
| **Closure** | Bloqueo admin sin ser reserva |
| **Price Rule** | Recargo por franja/día con prioridad |
| **Customer** | Reservante (nombre, email, teléfono); ≠ User autenticado |

### Ciclo de vida reserva

```
hold → pending → confirmed | cancelled | expired
```

- **hold:** bloquea 15 min
- **pending:** bloquea hasta validación staff
- **confirmed / cancelled / expired:** estados terminales

### Métodos de pago

- `cash` — efectivo en sede
- `deposit` — seña % por transferencia + comprobante
- `transfer_full` — total por transferencia + comprobante

---

## 8. Requisitos no funcionales

| Categoría | Requisito |
|-----------|-----------|
| **Performance** | LCP < 2.0s landing 4G; LazyMotion; imágenes AVIF/WebP |
| **Accesibilidad** | WCAG AA contraste (lime sobre navy OK; texto sobre lime = navy); mapa con lista alternativa |
| **SEO** | Metadata, OG, JSON-LD |
| **Animación** | CSS scroll-driven + Motion solo con estado; `prefers-reduced-motion` |
| **Validación** | Zod en forms y Server Actions |
| **Teléfonos** | libphonenumber-js formato AR |
| **Zona horaria** | Tucumán UTC-3; persistencia `timestamptz` en Supabase |
| **Seguridad admin** | Passcode fase 1; Supabase Auth + RLS fase 3 |
| **Anti double-booking** | Mock: overlap en memoria; Prod: `EXCLUDE USING gist` + pg_cron holds |
| **i18n** | Español (Argentina) únicamente en Fase 1 |

---

## 9. Arquitectura técnica (resumen)

```
app/                  → rutas, layouts, loading/error
components/           → landing, map, booking, admin, ui
lib/services/         → availability, pricing, reservations (puro)
lib/data/             → ports + adapter mock | supabase
```

- Server Components por defecto; Server Actions para mutaciones
- UI no accede al store directamente
- Turnos derivados en `availability.ts`; precios en `pricing.ts`
- Detalle: [`docs/architecture.md`](../../docs/architecture.md)

---

## 10. Fases de release

### Fase 1 — MVP público (mock)

**Entregables:**
- Landing completa
- Flujo reserva end-to-end
- Confirmación + WhatsApp
- Mis reservas lookup
- Capa mock con seed La Diagonal

**Definition of Done:**
- [ ] Reserva completa sin login en staging/prod
- [ ] 0 errores críticos en flujo feliz
- [ ] Tests `availability` y `pricing` pasan

### Fase 2 — Admin completo (mock)

**Entregables:**
- Dashboard KPIs
- Builder mapa
- CRUD canchas, horarios, precios, cierres
- Gestión reservas + comprobantes
- Configuración sede

**Definition of Done:**
- [ ] Staff puede operar un día completo solo desde admin
- [ ] Builder persiste geometría en mock store

### Fase 3 — Supabase + producción

**Entregables:**
- `docs/schema.sql` aplicado
- Adapter Supabase
- Auth admin + RLS
- pg_cron expiración holds
- Storage comprobantes

**Definition of Done:**
- [ ] Paridad funcional mock vs Supabase
- [ ] Holds expiran automáticamente
- [ ] Constraint anti-overlap activa

---

## 11. Dependencias y riesgos

| Dependencia | Impacto |
|-------------|---------|
| Datos reales La Diagonal (medidas, horarios, precios) | Bloquea seed fiel y piloto |
| WhatsApp como canal de cierre | Integrar, no reemplazar |
| Capacitación staff (30–45 min) | Adopción admin |

| Riesgo | Mitigación |
|--------|------------|
| Baja adopción web | QR en sede + link Instagram + coexistencia WhatsApp |
| Abandono en hold | Simplificar formulario; revisar copy pago |
| Mock sin persistencia entre deploys | Migrar Supabase antes de tráfico real |
| Resistencia al cambio | Piloto 90 días con métricas compartidas |

---

## 12. Métricas y analytics (piloto)

| Evento | Uso |
|--------|-----|
| `hold_created` | Intención de reserva |
| `hold_expired` | Fricción post-hold |
| `reservation_pending` | Conversión |
| `reservation_confirmed` | Éxito operativo |
| `admin_login` | Adopción panel |
| Reservas web vs manual | Sustitución WhatsApp |

*(Implementación analytics: fase post-MVP; métricas iniciales vía admin.)*

---

## 13. Identidad visual

Tokens de marca (ver `src/app/globals.css`):

- **Navy** `#123a63` — fondo marca
- **Lime** `#9be414` — acento / CTA
- **Gold** `#f2b72e` — variante sede Lomas de Tafí
- **Tipografía:** Anton (display) + Inter (UI)
- **Motivo:** cortes diagonales, patrón líneas de cancha, reveals scroll

---

## 14. Documentos relacionados

| Documento | Ubicación |
|-----------|-----------|
| Glosario dominio | [`CONTEXT.md`](../../CONTEXT.md) |
| Arquitectura | [`docs/architecture.md`](../../docs/architecture.md) |
| Schema DB | [`docs/schema.sql`](../../docs/schema.sql) |
| ADRs | [`docs/adr/`](../../docs/adr/) |
| Análisis negocio | [`../negocio/analisis-de-negocio.md`](../negocio/analisis-de-negocio.md) |
| Precios | [`../negocio/precios-y-monetizacion.md`](../negocio/precios-y-monetizacion.md) |
| Validación MVP | [`../comercial/validacion-del-mvp.md`](../comercial/validacion-del-mvp.md) |
| Speech venta | [`../comercial/speech-de-venta.md`](../comercial/speech-de-venta.md) |

---

## 15. Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | ago 2026 | PRD inicial — MVP La Diagonal, Fases 1–3 |
