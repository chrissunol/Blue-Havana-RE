# Blue Havana Real Estate API V2

Backend FastAPI conectado a Supabase para el frontend público y los paneles de administración.

## Funcionalidades incluidas

- Autenticación JWT para admin y superadmin.
- Administración de usuarios con desactivación segura.
- Propiedades y negocios mediante `listingType`.
- Publicación, edición, filtros e imágenes de propiedades.
- Registro atómico de ventas y rentas.
- Cancelación de operaciones y restauración de disponibilidad.
- Blog público y administrativo con imágenes.
- Reseñas públicas con moderación.
- Dashboard real con reseñas y transacciones.
- Información de empresa, incluyendo Telegram y YouTube.
- Solicitudes persistentes de modificación de perfil.

## 1. Preparar Supabase

Para una base existente, ejecuta en **Supabase > SQL Editor**:

```text
supabase/migration_backend_v2.sql
```

Para una instalación nueva puedes ejecutar:

```text
supabase/schema.sql
```

La migración crea o actualiza:

- `properties.listing_type`
- `blog_articles`
- `reviews`
- nuevas columnas en `property_transactions`
- nuevas columnas en `company_information`
- `modification_requests`
- bucket público `blog-images`
- funciones SQL atómicas para completar y cancelar operaciones

## 2. Configurar variables de entorno

Copia `.env.example` como `.env` y completa los valores reales.

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Nunca subas `.env` ni `SUPABASE_SERVICE_ROLE_KEY` a GitHub o al frontend.

## 3. Instalar y ejecutar

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 4000
```

macOS/Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 4000
```

Swagger:

```text
http://localhost:4000/docs
```

Health check:

```text
GET /health
```

## Endpoints principales

### Propiedades y negocios

```text
GET    /api/properties
GET    /api/properties?listingType=business
GET    /api/properties/admin/all
POST   /api/properties
PATCH  /api/properties/{id}
DELETE /api/properties/{id}
```

El backend acepta y devuelve:

```json
{
  "listingType": "property",
  "transactionStatus": "available"
}
```

### Ventas y rentas

```text
POST  /api/properties/{id}/mark-sold
POST  /api/properties/{id}/mark-rented
GET   /api/transactions
GET   /api/transactions/sales
GET   /api/transactions/rents
PATCH /api/transactions/{transaction_id}/cancel
```

El backend acepta el formato actual del frontend:

```json
{
  "finalAmount": 125000,
  "clientName": "Juan Pérez",
  "closedAt": "2026-06-29",
  "notes": "Operación completada"
}
```

### Blog

```text
GET    /api/blog/articles
GET    /api/blog/articles/{slug}
GET    /api/blog/admin/articles
POST   /api/blog/admin/articles
PATCH  /api/blog/admin/articles/{id}
PATCH  /api/blog/admin/articles/{id}/status
PATCH  /api/blog/admin/articles/{id}/featured
DELETE /api/blog/admin/articles/{id}
POST   /api/blog/admin/images
```

### Reseñas

```text
POST   /api/reviews
GET    /api/reviews/public
GET    /api/reviews/admin
PATCH  /api/reviews/{id}/approve
PATCH  /api/reviews/{id}/reject
DELETE /api/reviews/{id}
```

### Dashboard

```text
GET /api/dashboard
```

Devuelve estadísticas, reseñas y transacciones reales en una sola respuesta.

## Despliegue en Render

1. Ejecuta primero la migración SQL en Supabase.
2. Sube este backend a GitHub sin `.env`.
3. En Render configura todas las variables de `.env.example`.
4. Usa como comando de inicio:

```text
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Verifica:

```text
https://TU-SERVICIO.onrender.com/health
https://TU-SERVICIO.onrender.com/docs
```

## Comprobaciones realizadas

- Compilación de todos los módulos Python.
- Generación correcta del esquema OpenAPI.
- Validación de aliases usados por Angular.
- Pruebas HTTP de contratos para propiedades, transacciones, blog, reseñas y dashboard.
- Validación sintáctica del SQL de migración y del esquema completo.
