# Cancha Manager — transición de producto

Fecha: 2026-10-30. Estado: requisitos confirmados; implementación y verificación en curso.

## Decisiones confirmadas

- El proyecto pasa a ser un producto propio con nombre provisional **Cancha Manager**.
- La identidad visual será verde y blanca, inspirada en una cancha de fútbol.
- La propuesta de valor incluye una landing para el complejo y un sistema de reservas con administración.
- La Diagonal deja de ser cliente, referencia comercial y marca del producto. Retirar su presencia pública, imágenes, enlaces, redes, teléfonos y datos de pago del recorrido activo.
- Conservar el núcleo de reservas y gestión administrativa, corrigiendo fricciones y redundancias evidentes.
- Prioridad para las visitas presenciales del **31 de octubre de 2026**: demo con datos persistentes y administración privada. Incorporar clientes reales después.
- La demostración debe recorrer la landing del complejo, selección del turno, finalización de la reserva, mensaje de WhatsApp y aparición de esa misma reserva en administración.
- WhatsApp: mensaje preparado y envío manual por el reservante al número propio **3813379225**, normalizado para WhatsApp como **5493813379225**. No hay autorización para que el agente envíe mensajes.
- Oferta comercial: paquete completo de landing personalizada, reservas y administración, con CTA **Solicitar demo** y sin precios públicos.

## Primera ronda cerrada

El usuario confirmó demo persistente y privada, WhatsApp manual a su número y la oferta comercial recomendada.

## Segunda ronda confirmada

- Reutilizar Vercel y el nuevo proyecto Supabase personal fhrfnpjlamvbqvuprbrn.
- Confirmación manual del administrador y comprobantes reales privados; datos bancarios ficticios en la demo.
- Complejo Cancha Manager · Demo con 8 canchas: 2 de fútbol 5, 1 de fútbol 7, 1 de fútbol 9, 1 de fútbol 11, 2 de pádel y 1 multipropósito de handball/futsal.
- Administración privada y restablecimiento manual entre visitas.
- WhatsApp 3813379225 para reservas de demo y contacto comercial.
- El usuario confirmó el entendimiento compartido y autorizó la implementación.

## Separación de experiencias propuesta

Experiencias confirmadas:

- **Landing comercial del producto**: explica el beneficio para el dueño del complejo, muestra el recorrido y ofrece probar o solicitar una demo.
- **Landing del complejo de demostración**: presenta un complejo ficticio y permite reservar como jugador.
- **Administración de la demo**: muestra las mismas reservas generadas en el recorrido público y permite gestionarlas con acceso privado.

Rutas: / comercial, /demo complejo ficticio, /reservar flujo y /admin administración. Una demo de un complejo no prueba aislamiento entre múltiples clientes.

## Diagnóstico inicial (corregido por esta implementación)

- `src/lib/data/index.ts` siempre devuelve el adaptador mock.
- `src/lib/data/mock/store.ts` guarda una única sede en memoria del proceso. No hay persistencia ni selección o aislamiento de tenants.
- `src/lib/services/whatsapp.ts` genera un enlace con texto; no envía mensajes automáticamente.
- El nombre de La Diagonal también está en metadata, datos iniciales, mensajes, códigos y componentes administrativos.
- La página de detalle muestra “Seña Abonada” a partir de un importe calculado, sin verificación bancaria. Separar importe a transferir de pago verificado.
- El acceso a páginas administrativas usa cookie/passcode; las acciones de mutación inspeccionadas no verifican sesión por sí mismas. Protegerlas en el servidor.
- El formulario conserva `receiptFileName`; esto no constituye almacenamiento del comprobante.
- El contrato público de creación de hold recibe el intervalo. Verificar en servidor duración, horario, cierres, fecha futura y disponibilidad antes de aceptarlo.
- No hay `node_modules` al inicio de esta sesión; falta instalar dependencias y leer las guías de la versión local de Next.js antes de escribir código de aplicación.
- La conexión de Vercel lista un proyecto **la-diagonal** asociado al repositorio actual. No hay configuración `.vercel` local ni archivos de entorno en el checkout inspeccionado.
- La conexión de Supabase solo lista **CBA VOLLEY**, un producto distinto. No se modificó ese proyecto ni se lo considera almacenamiento de esta demo.

## Criterios de aceptación a desarrollar

- Recorrer la demostración completa sin referencias ni contactos del antiguo cliente.
- Conservar reservas después de reiniciar la aplicación en el entorno elegido.
- Ver la misma reserva y código desde el recorrido público y la administración.
- Impedir que dos reservas activas ocupen el mismo turno.
- Mostrar con claridad reserva pendiente, confirmación y situación del pago.
- No presentar una reserva de demo como un cobro real.
- Mantener una experiencia usable en celular, con teclado, foco visible, etiquetas y movimiento reducido.
- No publicar testimonios, métricas de clientes, integraciones ni garantías que el producto no pueda acreditar.

## Fuentes del proceso

La skill local `grill-with-docs` delega en `grilling` y `domain-modeling`, que no estaban instaladas localmente. Se consultaron sus instrucciones en el repositorio de origen indicado por `skills-lock.json`; no existe una herramienta `Skill` en esta sesión.

- [Grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md): resolver decisiones por rondas y confirmar entendimiento antes de actuar.
- [Domain modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md): registrar términos resueltos y contrastarlos con el código.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): consultadas el 2026-10-30; volver a obtenerlas al revisar la implementación final.
