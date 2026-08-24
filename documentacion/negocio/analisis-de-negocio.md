# Análisis de negocio — La Diagonal Booking Platform

## Resumen ejecutivo

La Diagonal Booking Platform es un SaaS vertical para complejos deportivos que combina **landing de alto rendimiento**, **reservas con mapa del predio** y **panel de administración** con builder de canchas. El primer cliente de referencia es el Complejo La Diagonal (Tafí Viejo, Tucumán), con visión de escalar a más sedes y redes como `reddecomplejos`.

El modelo recomendado no es cobrar al jugador final, sino **monetizar al complejo** mediante suscripción por sede, con take rate opcional cuando exista cobro digital integrado.

---

## Problema

Los complejos deportivos en Argentina operan con un stack fragmentado:

- Reservas por WhatsApp, llamadas y cuaderno — sin visibilidad centralizada de disponibilidad.
- Doble booking y turnos “fantasma” cuando varias personas consultan al mismo tiempo.
- Precios variables por horario y día difíciles de comunicar al cliente.
- Seña por transferencia sin un flujo claro de comprobante y validación.
- Ausencia de presencia digital profesional que convierta búsquedas en reservas.

El dolor no es “falta de software genérico”, sino **pérdida de ingresos por fricción operativa** y **dependencia de un canal informal (WhatsApp) que no escala**.

---

## Propuesta de valor

### Para el complejo (cliente B2B)

| Beneficio | Cómo lo resuelve el producto |
|-----------|------------------------------|
| Menos doble booking | Hold de 15 min + bloqueo por estado + (futuro) constraint en base de datos |
| Mapa del predio | El usuario elige cancha y horario en contexto espacial, no en una lista abstracta |
| Menos consultas repetitivas | Disponibilidad visible en tiempo real; link compartible con fecha/hora/deporte |
| Seña configurable | Porcentaje, alias, CBU y titular por sede; comprobante adjunto |
| Operación centralizada | Admin con reservas, horarios, precios, cierres y builder del plano |
| Multi-sede desde día 1 | Schema preparado para cadenas y redes regionales |

### Para el jugador (usuario final, no pagador directo)

- Reserva como invitado, sin login obligatorio.
- Estado claro: verde/rojo por horario, no solo “ocupado”.
- Confirmación con código + CTA a WhatsApp con mensaje prearmado.
- “Mis reservas” por código + teléfono.

### Diferenciadores frente a alternativas genéricas

1. **Mapa del predio** como interfaz principal — no un calendario tipo salon de belleza.
2. **Builder drag-and-drop** del plano — el complejo modela su realidad física, no adapta plantillas.
3. **Turnos derivados** — horarios flexibles por deporte (60 min fútbol, 90 min pádel) sin mantener slots en DB.
4. **Guest-first** — alineado con el comportamiento real del mercado argentino.
5. **Performance y SEO** — landing como activo de adquisición, no solo backend de reservas.

---

## Mercado y segmento

### Mercado primario (Fase 1–2)

- Complejos deportivos con **3+ canchas** en ciudades medianas de Argentina (interior incluido).
- Operadores que ya usan WhatsApp intensivamente y tienen **picos de demanda** (noches, fines de semana).
- Sedes con **precios diferenciados** por franja horaria o día.

### Mercado secundario (Fase 3+)

- Redes multi-sede (`reddecomplejos`, cadenas regionales).
- Clubes con escuelita, torneos y eventos (upsell de módulos).
- Complejos con pádel de alta rotación (90 min, mayor complejidad de agenda).

### Tamaño de oportunidad (orden de magnitud)

No hay un dato público consolidado de “cantidad de complejos” en Argentina. La tesis es **vertical SaaS de nicho**: pocos miles de complejos relevantes, ticket mensual moderado, baja rotación si el producto resuelve el dolor operativo diario.

La Diagonal como **design partner** valida el vertical antes de escalar adquisición pagada.

---

## Modelo de negocio recomendado

### Estructura: híbrido SaaS + valor transaccional opcional

```
Ingreso recurrente (core)     →  Suscripción mensual por sede activa
Ingreso one-time (filtro)     →  Setup / onboarding del mapa y configuración
Ingreso variable (fase 2+)    →  Fee por reserva pagada online (solo si hay gateway)
Add-ons                       →  Multi-sede, notificaciones, white-label liviano
```

### Qué NO hacer al inicio

| Modelo | Por qué evitarlo en MVP |
|--------|-------------------------|
| Marketplace B2C (cobrar al jugador) | Compite con confianza local y WhatsApp; el club percibe que “le sacan margen” |
| Solo % desde día 1 sin pagos integrados | No hay base medible; genera desconfianza sin valor claro |
| Freemium eterno | Atrae curiosos; en vertical local la conversión es baja |
| Licencia perpetua cara | Frena adopción en interior; preferir MRR + setup moderado |
| Cobro por cancha | Castiga crecimiento; el valor no escala linealmente con cantidad de canchas |

### Unidad de cobro: por sede (venue)

- El costo de servir una sede adicional es bajo (misma infra, mismo producto).
- El valor percibido escala con “tengo mi predio digitalizado y mis reservas ordenadas”.
- Multi-sede se empaqueta como tier **Red** con descuento por volumen.

---

## Competencia y alternativas

| Alternativa | Fortaleza | Debilidad vs. nuestro producto |
|-------------|-----------|--------------------------------|
| WhatsApp + cuaderno | Cero fricción, confianza | No escala, doble booking, sin analytics |
| Google Calendar / Sheets | Gratis, familiar | No mapa, no precios dinámicos, no hold |
| Apps genéricas de turnos | Maduras, baratas | No entienden canchas, deportes ni plano del predio |
| Software de clubes grandes | Completo | Caro, overkill para complejo de barrio |
| Redes tipo Playtomic (pádel) | Pagos, red de jugadores | Enfoque pádel/red; menos flexible para fútbol 5–11 mixto |

**Posicionamiento:** no “otro calendario”, sino **el plano digital del complejo** con reservas, precios y operación en un solo lugar.

---

## Go-to-market por fases

### Fase 1 — Piloto La Diagonal (validación)

- Un cliente, precio simbólico o gratuito a cambio de feedback y case study.
- Objetivo: retención operativa (¿lo usan todos los días?) no ARR.
- Entregable: landing + reservas end-to-end sobre mock/Supabase.

### Fase 2 — Primeros 5–10 complejos (Tucumán y regiones cercanas)

- Suscripción por sede + setup de mapa.
- Venta consultiva: demo con el mapa de La Diagonal como prueba social.
- Canal: boca a boca, Instagram de complejos, contacto directo post-partido.

### Fase 3 — Redes y pagos digitales

- Tier multi-sede para cadenas.
- Integración Mercado Pago / transferencia automática + take rate o fee fijo por reserva pagada.
- Posible partnership con `reddecomplejos` u operadores regionales.

---

## Métricas clave del negocio

### Producto (validación MVP)

| Métrica | Qué indica |
|---------|------------|
| Reservas completadas / semana | Adopción real del flujo |
| % reservas vía web vs. WhatsApp manual | Sustitución del canal informal |
| Tasa de abandono en hold | Fricción del formulario/pago |
| Tiempo admin en confirmar reserva | Valor operativo del panel |
| Canchas con >70% ocupación en horario pico | Oportunidad de precios dinámicos |

### Negocio (post-piloto)

| Métrica | Meta orientativa |
|---------|------------------|
| MRR por sede | Según tier (ver doc de precios) |
| Churn mensual | < 5% en vertical local |
| CAC | Bajo (venta directa, referidos) |
| LTV | 12+ meses de retención |
| NPS del dueño/admin | > 40 antes de escalar marketing |

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| “Seguimos con WhatsApp” | Integrar WhatsApp como confirmación, no como competidor |
| Resistencia al cambio del staff | Admin simple + capacitación en setup |
| Complejos chicos (1–2 canchas) | Tier Starter accesible; ROI en “1 turno recuperado/mes” |
| Competidor copia el mapa | Velocidad de ejecución + builder + multi-sede + soporte local |
| Dependencia de un solo cliente piloto | Documentar case study y buscar 2.º complejo antes de mes 3 |

---

## Visión a largo plazo

Plataforma **white-label liviano** para redes de complejos en LATAM:

- Cada sede con mapa, precios y horarios propios.
- Dashboard consolidado para la red.
- Pagos opcionales con revenue share.
- Datos anonimizados de ocupación como ventaja competitiva (benchmark regional).

La Diagonal no es solo el primer cliente: es el **laboratorio de producto** que define el vertical antes de generalizar.

---

## Documentos relacionados

- [Precios y monetización](./precios-y-monetizacion.md)
- [Validación del MVP](../comercial/validacion-del-mvp.md)
- [Speech de venta](../comercial/speech-de-venta.md)
