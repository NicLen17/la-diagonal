# Validación del MVP — Plan de producto y salida a venta

Guía para usar el MVP con La Diagonal y los primeros complejos objetivo, con métricas concretas y criterios de éxito antes de escalar comercialmente.

---

## Objetivo del MVP

Validar que un complejo deportivo **adopta el flujo digital de reservas** y que el producto **reduce fricción operativa** medible, no demostrar que el software “funciona técnicamente”.

**Hipótesis a validar:**

1. Los jugadores completan reservas sin login y sin abandonar en masa el hold.
2. El mapa del predio es más claro que una lista o solo WhatsApp.
3. El admin confirma reservas y revisa comprobantes más rápido que por chat.
4. El dueño percibe valor suficiente para pagar suscripción mensual post-piloto.

---

## Alcance del MVP para validación

### Incluido (Fase 1 — must have)

| Capacidad | Rol en validación |
|-----------|-------------------|
| Landing con CTA a reservar | Adquisición orgánica / Google |
| `/reservar` con mapa + filtros URL | Core del producto |
| Hold 15 min + formulario + pago | Flujo completo |
| Confirmación + WhatsApp prearmado | Cierre del loop sin gateway |
| `/mis-reservas` por código + teléfono | Confianza post-reserva |
| Admin: reservas + confirmar/cancelar | Operación diaria |

### Incluido (Fase 2 — refuerza venta)

| Capacidad | Rol en validación |
|-----------|-------------------|
| Builder del mapa | Diferenciador en demo comercial |
| Precios dinámicos + preview | Argumento Pro tier |
| Dashboard KPIs | ROI visible para el dueño |
| Horarios + cierres | Operación real del complejo |

### Fuera de alcance MVP (no bloquean validación)

- Login de jugadores / magic link completo
- Mercado Pago integrado
- Multi-sede en UI
- App móvil nativa
- Notificaciones SMS

---

## Plan de piloto con La Diagonal (90 días)

### Semana 1–2: Implementación y onboarding

- [ ] Mapear predio real (dimensiones + canchas F5/F7/F11/pádel).
- [ ] Cargar horarios reales y precios base.
- [ ] Configurar seña (%), alias, CBU, WhatsApp.
- [ ] Capacitar a 1–2 personas del staff (30–45 min).
- [ ] Publicar link en Instagram / cartel en sede: “Reservá online”.

### Semana 3–6: Convivencia con WhatsApp

**Regla:** no apagar WhatsApp de golpe. Coexistencia controlada:

- Respuesta automática o manual en WhatsApp: *“Podés reservar directo acá: [link]”*.
- Reservas que lleguen por WhatsApp se cargan manualmente en admin (baseline de comparación).
- Medir cuántas reservas entran por web vs. manual.

### Semana 7–10: Optimización

- Revisar abandonos en hold (¿formulario largo? ¿confusión de pago?).
- Ajustar copy del mapa y mensajes de estado.
- Iterar precios/reglas si hay consultas repetidas de “¿cuánto sale a las 21?”.

### Semana 11–12: Cierre de piloto

- Entrevista de cierre con dueño/admin (30 min).
- Consolidar métricas y decidir: ¿pasa a pagador? ¿case study público?
- Preparar demo grabada (2–3 min) para próximos prospectos.

---

## Métricas de validación

### Métricas primarias (decisión go/no-go)

| Métrica | Cómo medirla | Meta piloto (90 días) |
|---------|--------------|------------------------|
| Reservas completadas vía web | Conteo en admin `confirmed` + `pending` origin=web | ≥ 30 total o ≥ 5/semana sostenidas |
| Tasa de conversión hold → pending | holds que pasan a pending / holds creados | ≥ 60% |
| Adopción admin | Días con al menos 1 login admin / semana | ≥ 5 días/semana |
| Incidentes doble booking | Reportes manuales | 0 en reservas vía web |

### Métricas secundarias (calidad de producto)

| Métrica | Meta orientativa |
|---------|------------------|
| Tiempo medio confirmación admin | < 4 h en horario laboral |
| % reservas con comprobante adjunto (seña/transfer) | > 80% cuando aplica |
| Abandono en `/reservar` sin hold | Monitorear; no hay meta fija en piloto |
| Feedback cualitativo dueño | “Lo seguiría usando” = éxito |

### Señales de fracaso (pivot o pausa)

- < 10 reservas web en 60 días con link visible en sede y redes.
- Staff sigue cargando todo manual “porque es más rápido”.
- Jugadores insisten en WhatsApp y abandonan en el paso de pago.
- Dueño no dispone 30 min para onboarding inicial.

---

## Criterios de éxito del MVP

El MVP está **validado** si se cumplen **3 de 4**:

1. ≥ 5 reservas web por semana durante al menos 4 semanas consecutivas.
2. Dueño/admin confirma que usaría el sistema pagando (entrevista).
3. Cero doble booking atribuible al sistema en el periodo.
4. Al menos 1 testimonial usable comercialmente.

Si se cumplen 2 o menos → iterar producto o ajustar canal (más visibilidad del link) antes de vender a terceros.

---

## Plan de salida a venta (post-piloto)

### Mes 3: Primer cliente pagador externo

**Perfil ideal del cliente #2:**

- 4–8 canchas, Tucumán o NOA.
- Ya postea en Instagram pero reserva por WhatsApp.
- Dueño accesible (no cadena corporativa).
- Dolor explícito: “se nos pisan turnos” o “no sabemos quién pagó la seña”.

**Acciones:**

1. Demo de 15 min con mapa de La Diagonal (anonimizado si hace falta).
2. Oferta **Starter** con setup incluido si cierra en 15 días.
3. Objetivo: 1 contrato firmado.

### Mes 4–6: Primeros 5 clientes

- Referido desde La Diagonal (incentivo: 1 mes gratis).
- Prospección directa: lista de 20 complejos en Instagram, contacto DM + llamada.
- Contenido: reel “así se reserva en el mapa” + case study PDF.

### Mes 6+: Escalar solo si

- Churn piloto = 0 (La Diagonal sigue activa).
- ≥ 3 clientes pagadores.
- Soporte < 15 h/semana total.

---

## Materiales mínimos para vender

| Material | Estado | Uso |
|----------|--------|-----|
| Demo en vivo (localhost o staging) | MVP | Reuniones |
| Landing La Diagonal en producción | MVP | Prueba social |
| PDF 1 página “Cómo funciona” | Crear post-piloto | WhatsApp comercial |
| Case study La Diagonal | Post semana 12 | Credibilidad |
| Video 2 min screen recording | Post semana 8 | Redes / DM |
| Contrato SaaS simple | Antes del 1.º pagador | Cierre legal |

---

## Riesgos del piloto y mitigación

| Riesgo | Mitigación |
|--------|------------|
| “Es tu proyecto, no lo usamos en serio” | Compromiso escrito de uso + métricas compartidas |
| Mock sin persistencia real | Migrar a Supabase antes de semana 4 si hay tráfico |
| Staff no capacitado | Segunda sesión gratuita + video grabado |
| Jugadores no encuentran el link | QR en recepción + bio Instagram |
| Temporada baja (vacaciones) | Extender piloto 30 días o medir ocupación relativa |

---

## Checklist semanal durante el piloto

**Cada lunes (15 min):**

- [ ] Revisar reservas de la semana anterior (web vs. manual).
- [ ] Revisar holds expirados (fricción).
- [ ] Una mejora pequeña de producto o copy.

**Cada mes:**

- [ ] Llamada de 20 min con contacto del complejo.
- [ ] Actualizar números del case study borrador.
- [ ] Decidir si el producto está listo para demo externa.

---

## Documentos relacionados

- [Análisis de negocio](../negocio/analisis-de-negocio.md)
- [Precios y monetización](../negocio/precios-y-monetizacion.md)
- [Speech de venta](./speech-de-venta.md)
