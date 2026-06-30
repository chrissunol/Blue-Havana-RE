# Cambios realizados en el backend V2

## Backend

- Se agregó soporte completo para `listingType=property|business`.
- Las propiedades ahora devuelven `transactionStatus` además de `status`.
- Se aceptan los nombres camelCase usados por Angular en ventas y rentas.
- Las operaciones se crean mediante una función SQL atómica.
- Se agregó cancelación de transacciones y restauración de propiedades.
- Se creó el backend completo del blog.
- Se creó el backend completo de reseñas y moderación.
- Se creó un endpoint real para el dashboard.
- Se agregaron Telegram y YouTube a la información de empresa.
- `DELETE /api/users/{id}` ahora hace borrado lógico compatible con el frontend.
- Se corrigió el módulo de solicitudes de modificación, que antes importaba listas inexistentes.

## Supabase

Ejecutar:

```text
supabase/migration_backend_v2.sql
```

antes de desplegar la nueva versión del backend.

## Pendiente en el frontend

El backend ya está preparado, pero el frontend compilado todavía mantiene algunas operaciones locales. El cambio más importante será conectar `confirmTransaction()` con:

```text
POST /api/properties/{id}/mark-sold
POST /api/properties/{id}/mark-rented
```

También deberán reemplazarse los arreglos locales de blog, reseñas y dashboard por llamadas HTTP.
