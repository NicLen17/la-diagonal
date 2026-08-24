# Precios y monetización

Análisis de precios, empaquetado comercial y recomendaciones para comenzar a cobrar. Complementa [Análisis de negocio](./analisis-de-negocio.md).

---

## Principios de pricing

1. **Cobrar al complejo, no al jugador** — el usuario final no debe percibir “impuesto” sobre el turno.
2. **Precio predecible** — suscripción mensual fija; variables solo cuando hay valor medible (pago online).
3. **ROI en lenguaje del dueño** — “cuesta menos que un turno perdido por semana”.
4. **Por sede, no por cancha** — evita castigar complejos grandes y simplifica la venta.
5. **Setup como filtro** — onboarding del mapa tiene costo; filtra curiosos y financia tiempo de implementación.

---

## Benchmark de referencia (Argentina, 2026)

Valores orientativos en pesos argentinos. Ajustar según inflación y conversación con el primer cliente pagador.

| Concepto | Rango sugerido | Notas |
|----------|----------------|-------|
| Turno fútbol 5 (Tucumán) | $20.000 – $35.000 | La Diagonal ~$25.000 según plan de producto |
| Turno pádel 90 min | $30.000 – $50.000 | Mayor ticket, menor rotación |
| Software genérico turnos | $15.000 – $40.000/mes | Sin mapa ni vertical deportivo |
| Setup / implementación | $80.000 – $200.000 one-time | Mapa + horarios + capacitación |

**Regla práctica:** la suscripción mensual debería representar **1–3 turnos equivalentes al mes** del complejo. Si pierden o desordenan 2 turnos F5 a $25.000, ya hay $50.000 de valor; un plan de $35.000–$45.000/mes es defendible.

---

## Estructura de planes propuesta

### Starter — 1 sede, operación básica

**Para:** complejos con 2–5 canchas que quieren salir del caos de WhatsApp.

| Incluye | Límite |
|---------|--------|
| Landing + mapa de reservas | 1 sede |
| Flujo hold → confirmación + WhatsApp | — |
| Admin: reservas, canchas, horarios básicos | — |
| Soporte por email / WhatsApp | Horario comercial |

**Precio sugerido:** $29.000 – $39.000 ARS/mes  
**Setup:** $100.000 ARS (mapa del predio + 2 h capacitación)

---

### Pro — sede con precios dinámicos y operación completa

**Para:** La Diagonal y complejos con múltiples deportes, reglas de precio y comprobantes.

| Incluye | Límite |
|---------|--------|
| Todo Starter | — |
| Reglas de precio por franja y día | Ilimitadas |
| Cierres, overrides por cancha | — |
| Dashboard KPIs (ocupación, ingresos, pico) | — |
| Builder del mapa (drag-and-drop) | — |
| Revisión de comprobantes | — |

**Precio sugerido:** $49.000 – $69.000 ARS/mes  
**Setup:** $150.000 ARS

---

### Red — multi-sede

**Para:** cadenas tipo `reddecomplejos`, operadores con 2+ predios.

| Incluye | Límite |
|---------|--------|
| Todo Pro por sede | Descuento por volumen |
| Dashboard consolidado | — |
| Branding por sede | Logo/colores |
| Roles admin por sede | — |

**Precio sugerido:** $39.000 – $55.000 ARS/mes **por sede** (mínimo 2 sedes)  
**Setup:** $120.000 ARS por sede adicional (mapa)

---

## Take rate y pagos digitales (Fase 3)

Cuando se integre Mercado Pago u otro gateway:

| Modalidad | Comisión sugerida | Cuándo aplicar |
|-----------|-------------------|----------------|
| Efectivo / transferencia manual | **0%** | Flujo actual MVP |
| Seña o total pagado en plataforma | **1,5% – 3%** | Solo sobre monto procesado |
| Fee fijo por reserva confirmada online | **$500 – $1.500 ARS** | Alternativa más predecible que % |

**Recomendación:** ofrecer **ambas opciones** al cliente — % para tickets altos (pádel), fee fijo para F5. El complejo elige en configuración.

No activar take rate hasta que el volumen online supere ~20% de reservas; antes es ruido comercial.

---

## Pricing del piloto La Diagonal

Objetivo del piloto: **validar producto**, no maximizar ingresos.

| Opción | Condición | Precio |
|--------|-----------|--------|
| **Design partner** (recomendado) | Feedback quincenal + permiso de case study + logo en landing | **$0/mes** primeros 60–90 días; luego Pro con 50% descuento 6 meses |
| **Piloto pago simbólico** | Compromiso de uso diario del admin | **$15.000/mes** + setup bonificado |
| **Piloto full price** | Solo si ya hay segundo cliente de referencia | Pro estándar |

**Entregables del piloto a cambio del descuento:**

- Métricas compartidas (reservas/semana, abandono, horarios pico).
- 2 entrevistas de feedback (inicio y cierre).
- Testimonial escrito o video corto si el resultado es positivo.
- Permiso para usar capturas del mapa en material comercial (sin datos personales).

---

## Break-even simplificado

Supuestos para un operador solo (sin empleados):

| Concepto | Valor mensual |
|----------|---------------|
| Hosting (Vercel + Supabase) | ~USD 20–50 → ~$25.000–$60.000 ARS |
| Dominio + misc | ~$5.000 ARS |
| Tiempo soporte (10 h × $8.000/h) | ~$80.000 ARS |
| **Costo operativo aproximado** | **~$110.000–$145.000 ARS/mes** |

Con **3 clientes Pro a $55.000/mes** → ~$165.000 MRR → break-even operativo alcanzable con pocas sedes.

El setup one-time acelera el cash flow inicial: 3 setups × $150.000 = $450.000 en el primer mes de ventas.

---

## Descuentos y políticas

| Situación | Política |
|-----------|----------|
| Pago anual anticipado | 2 meses gratis (~17% descuento) |
| Segunda sede del mismo dueño | 15% en la sede adicional |
| Referido que cierra | 1 mes gratis para ambos |
| ONG / escuelita barrial | Evaluar tier social case-by-case |
| Precio congelado | 12 meses al firmar en Pro o Red |

Evitar descuentos ad hoc sin contrapartida (testimonial, referido, datos de uso).

---

## Cómo presentar el precio en la venta

### Anclaje recomendado

> “Un turno de fútbol 5 hoy está en $25.000. Si el sistema evita **dos conflictos de horario por mes**, ya se pagó solo. El plan Pro son $X por mes — menos de lo que pierden un sábado a la noche por un doble booking.”

### Orden de presentación

1. Dolor (WhatsApp, doble booking, seña sin comprobante).
2. Demo del mapa (wow moment).
3. ROI en turnos, no en “software”.
4. Precio Pro como default; Starter solo si presupuesto es objeción real.
5. Setup como inversión única: “en una tarde dejamos tu predio mapeado”.

### Qué no decir

- “Es barato” — resta valor.
- “Después vemos el precio” — genera desconfianza.
- “Cobramos % de cada reserva” — en Fase 1, sin gateway, no aplica.

---

## Roadmap de monetización

| Fase | Timing | Modelo de ingreso |
|------|--------|-------------------|
| MVP / piloto | Mes 0–3 | $0 o simbólico; foco en métricas |
| Primeros pagadores | Mes 3–6 | Starter + Pro; setup obligatorio |
| Escala regional | Mes 6–12 | Pro + Red; referidos |
| Pagos integrados | Mes 12+ | Take rate opcional sobre online |
| Add-ons | Continuo | SMS, torneos, escuelita, API |

---

## Checklist antes de cobrar el primer peso

- [ ] Flujo reserva end-to-end estable (hold → confirmación → WhatsApp).
- [ ] Admin usable sin capacitación extensa (>30 min onboarding).
- [ ] Al menos 2 semanas de uso real en La Diagonal con datos.
- [ ] Case study borrador con números (aunque sean estimados).
- [ ] Contrato simple (servicio SaaS, SLA básico, datos del complejo).
- [ ] Facturación definida (monotributo / responsable inscripto según tu situación).

---

## Documentos relacionados

- [Análisis de negocio](./analisis-de-negocio.md)
- [Validación del MVP](../comercial/validacion-del-mvp.md)
- [Speech de venta](../comercial/speech-de-venta.md)
