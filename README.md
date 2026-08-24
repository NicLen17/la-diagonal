# La Diagonal — Booking Platform

Plataforma de reservas para complejos deportivos: landing de alto rendimiento, mapa interactivo del predio y panel de administración con builder de canchas. Primer cliente de referencia: **Complejo La Diagonal** (Tafí Viejo, Tucumán), con arquitectura multi-sede preparada para escalar a más clientes.

## Qué incluye

| Área | Descripción |
|------|-------------|
| **Landing** | Hero, deportes, cómo funciona, preview del mapa, servicios, opiniones, contacto, SEO + JSON-LD |
| **Reservas** | Mapa del predio, filtros en URL, hold 15 min, formulario, pago (efectivo / seña / transferencia), confirmación + WhatsApp |
| **Mis reservas** | Consulta por código de reserva + teléfono |
| **Admin** | Dashboard, builder del mapa, canchas, reservas, horarios, precios, configuración de sede |

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript strict
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Animaciones:** Motion (estado) + CSS scroll-driven (decorativo)
- **Validación:** Zod · **Fechas:** date-fns · **Teléfonos:** libphonenumber-js
- **Datos:** capa mock intercambiable (`DATA_ADAPTER=mock`); schema Supabase documentado para producción

## Requisitos

- Node.js 20+
- npm

## Arranque local

```bash
npm install
cp .env.example .env.local   # opcional: ajustar passcode admin
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ADMIN_PASSCODE` | `diagonal2026` | Passcode del panel admin (fase mock) |
| `DATA_ADAPTER` | `mock` | `mock` \| `supabase` (cuando esté implementado) |

### Admin

- URL: [/admin/login](http://localhost:3000/admin/login)
- Passcode: valor de `ADMIN_PASSCODE` en `.env.local`

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing marketing |
| `/reservar` | Mapa del predio + filtros (`?fecha=&deporte=&hora=&cancha=`) |
| `/reservar/confirmar` | Datos del reservante + método de pago |
| `/reserva/[code]` | Confirmación + CTA WhatsApp |
| `/mis-reservas` | Lookup por código + teléfono |
| `/admin` | Dashboard KPIs |
| `/admin/mapa` | Builder del predio (drag-and-drop) |
| `/admin/canchas` | CRUD de canchas |
| `/admin/reservas` | Gestión de reservas y comprobantes |
| `/admin/horarios` | Plantillas horarias y cierres |
| `/admin/precios` | Reglas de precio + preview |
| `/admin/configuracion` | Sede, seña, datos bancarios, WhatsApp |

## Estructura del proyecto

```
src/
├── app/                    # Rutas App Router (marketing, reservas, admin)
├── components/
│   ├── landing/            # Secciones de la landing
│   ├── booking/            # Flujo de reserva
│   ├── map/                # Renderer compartido del plano
│   ├── admin/              # Panel de administración
│   └── ui/                 # Primitivas shadcn
├── hooks/                  # use-draggable-rect, use-mobile
└── lib/
    ├── data/               # types, schemas, ports, mock adapter
    └── services/           # availability, pricing, reservations, whatsapp
docs/                       # Arquitectura, schema SQL, ADRs
documentacion/              # Negocio, comercial, PRD
CONTEXT.md                  # Glosario de dominio
```

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run test:services # Tests de availability y pricing
```

## Fases del producto

| Fase | Estado | Alcance |
|------|--------|---------|
| **1 — MVP público** | En curso | Landing + reservas end-to-end sobre mock |
| **2 — Admin completo** | En curso | Builder, precios, horarios, dashboard |
| **3 — Supabase** | Documentado | Adapter real, Auth, RLS, pg_cron |

## Documentación

### Producto

- [`documentacion/producto/prd.md`](./documentacion/producto/prd.md) — Product Requirements Document
- [`CONTEXT.md`](./CONTEXT.md) — Glosario de dominio

### Ingeniería

- [`docs/architecture.md`](./docs/architecture.md) — Capas, flujo de datos, migración mock → Supabase
- [`docs/schema.sql`](./docs/schema.sql) — Schema Postgres + RLS + RPCs + pg_cron
- [`docs/adr/`](./docs/adr/) — Architecture Decision Records

### Negocio y comercial

- [`documentacion/`](./documentacion/) — Análisis de negocio, precios, validación MVP, speech de venta

## Próxima iteración (Supabase)

1. Aplicar `docs/schema.sql` en el proyecto Supabase
2. Implementar `lib/data/supabase/` respetando los ports existentes
3. Configurar `DATA_ADAPTER=supabase`
4. Reemplazar passcode admin por Supabase Auth + `profiles.role`

## Licencia

Proyecto privado — Complejo La Diagonal / Red de Complejos.
