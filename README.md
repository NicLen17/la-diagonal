# Cancha Manager

Producto para complejos deportivos: landing personalizada, reservas y administración. La marca provisional usa verdes y blancos. La demo representa un complejo ficticio; no es un caso de éxito ni recibe pagos reales.

## Arranque

Instalá con npm ci. Configurá .env.local con SUPABASE_URL, SUPABASE_SECRET_KEY, DATA_ADAPTER=supabase, ADMIN_PASSCODE (mínimo 12 caracteres), TZ=America/Argentina/Tucuman y NEXT_PUBLIC_SITE_URL. Luego ejecutá npm run dev.

La clave de servidor solo se utiliza desde Next.js; nunca debe llevar el prefijo NEXT_PUBLIC_ ni subirse a Git. La sesión de administración está firmada y expira a las 12 horas.

## Recorrido

- /: landing comercial y contacto para solicitar demo, sin precios públicos.
- /demo: complejo ficticio con 2 canchas de fútbol 5, 1 de fútbol 7 y 2 de pádel.
- /reservar: fecha, deporte, horario, mapa o lista; reserva temporal de 15 minutos.
- /reservar/confirmar: datos, modalidad de pago y comprobante real de hasta 3 MB.
- /reserva/[code]: resumen privado, estado y enlace a WhatsApp con envío manual.
- /mis-reservas: recuperar acceso con código y teléfono completo.
- /admin: gestión privada; las reservas nuevas aparecen pendientes.
- /admin/reservas: revisar el comprobante y confirmar o cancelar. Se actualiza cada 15 segundos mientras la pestaña está visible.
- /admin/configuracion: configuración y restablecimiento manual de la demo, con confirmación explícita.

El mensaje de WhatsApp no se envía automáticamente y no adjunta archivos. La reserva ya existe antes de abrir WhatsApp. La confirmación la realiza administración; el sistema no verifica pagos bancarios.

## Persistencia

Proyecto Supabase dedicado: fhrfnpjlamvbqvuprbrn. Migraciones versionadas en supabase/migrations. Tablas normalizadas con RLS y acceso solo para el servidor; bucket privado cm-receipts. Las reservas concurrentes se protegen con una restricción de exclusión en Postgres. El modo mock solo se permite durante desarrollo.

## Comprobaciones

- npm run lint
- npx tsc --noEmit (ejecutar npx next typegen antes del primer chequeo)
- npm run test:services
- node --env-file=.env.local scripts/test-persistence.mjs (solo contra la demo; limpia sus propios datos)
- npm run build

## Alcance

Es una demostración persistente de una sede. El aislamiento y alta de clientes reales, roles por organización, suscripciones y pasarela de pagos quedan para una etapa posterior. No promocionar esas funciones como disponibles.

## Documentación

[Requisitos](docs/cancha-manager-requirements.md), [glosario](GLOSSARY.md), [arquitectura](docs/architecture.md) y [decisiones](docs/adr/0006-persistent-sales-demo.md).
