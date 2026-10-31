# Arquitectura de Cancha Manager

Next.js 16.3 App Router, React 19, Tailwind 4, shadcn/ui y Postgres/Supabase. Consultar las guías de la versión instalada antes de cambiar convenciones.

La landing comercial es independiente de los datos del complejo. La demo, reservas y administración comparten repositorios a través de lib/data/ports.ts. DATA_ADAPTER=supabase selecciona el adaptador persistente; el mock solo se admite en desarrollo.

Los identificadores y campos del contrato se conservan en las tablas cm_* para evitar traducciones ambiguas entre la UI y el adaptador. El servidor consulta la Data API sin caché. Las acciones validan datos y permisos antes de mutar; el proxy redirige visitantes no autenticados de administración.

La sesión privada usa una cookie httpOnly, SameSite=Lax, Secure en producción, firmada con HMAC y vencimiento a las 12 horas. El passcode se configura en el entorno, sin fallback público. Cada reserva temporal queda vinculada al navegador mediante una firma; consultar por código y teléfono completo permite recuperar acceso en otro dispositivo.

Postgres crea y completa las reservas en transacciones. Una restricción EXCLUDE sobre cancha e intervalo impide superposiciones. Los holds vencidos se liberan al consultar disponibilidad o crear otra reserva. Las reservas finalizadas pasan a pending; el administrador revisa y confirma. La confirmación no acredita automáticamente el dinero recibido.

Los comprobantes se validan por tamaño (3 MB) y firma de archivo antes de guardarse en Storage privado. Solo administración puede obtenerlos a través de una ruta de Next con validación de sesión. Nunca se adjuntan automáticamente al enlace de WhatsApp.

Las fechas y precios del núcleo se resuelven en America/Argentina/Tucuman. Las claves de servidor viven en .env.local y en Vercel; no se exponen al cliente.

Esta entrega opera una sede de demo. Antes de incorporar clientes reales, añadir identidad por organización, aislamiento consistente en repositorios/RLS, límites de uso y recuperación de cuenta. No se debe tratar esta demo como SaaS multiempresa terminado.
