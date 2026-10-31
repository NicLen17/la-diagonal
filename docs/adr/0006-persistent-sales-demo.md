# ADR 0006 — Demo comercial persistente y separada de la marca del producto

Estado: aceptado el 30 de octubre de 2026.

## Contexto

La negociación del prospecto inicial terminó sin concretarse. El producto pasa a llamarse Cancha Manager y necesita demostrar un recorrido completo en visitas presenciales. El adaptador en memoria perdía reservas al reiniciar y no representaba una operación compartida entre dispositivos.

## Decisión

Separar la landing comercial del producto y la landing de un complejo ficticio. Usar un proyecto Supabase dedicado con tablas normalizadas, bloqueo de superposiciones en Postgres y comprobantes privados. Conservar los contratos del núcleo y seleccionar un adaptador persistente.

En esta etapa solo el servidor accede a los datos con una clave secreta; las tablas tienen RLS y los roles públicos no tienen acceso. El acceso administrativo usa una sesión firmada y passcode privado. No se implementa todavía alta de clientes reales ni aislamiento multiempresa.

## Alternativas

Mantener memoria simplificaba el trabajo pero no conservaba las demostraciones. Guardar JSON en disco no es adecuado para el filesystem efímero de Vercel. Completar primero el SaaS multiempresa ampliaba el alcance antes de validar comercialmente el producto.

## Consecuencias

La demo puede compartir y conservar reservas entre dispositivos y reinicios. Su reinicio debe ser una acción privada y explícita. Las credenciales y permisos necesitan configuración de entorno. La incorporación de clientes reales exige una nueva etapa de arquitectura y seguridad; no basta con duplicar el seed.
