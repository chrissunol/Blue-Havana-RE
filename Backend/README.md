# Inmobiliaria API - FastAPI + Supabase

API preparada para una web inmobiliaria con dos partes separadas:

1. **Frontend público:** solo muestra casas publicadas.
2. **Panel admin/superadmin:** login separado para crear, editar, publicar, ocultar y subir imágenes.

## Requisitos

- Python 3.10+
- Cuenta/proyecto en Supabase
- Supabase `SERVICE_ROLE_KEY` solo en backend. Nunca en frontend.

## Instalación

```bash
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Copia `.env.example` a `.env` y completa tus valores.

## Supabase

1. Entra a Supabase > SQL Editor.
2. Ejecuta `supabase/schema.sql`.
3. Asegúrate de tener el bucket público `property-images`.
4. Usa `SUPABASE_SERVICE_ROLE_KEY` en `.env`, nunca la anon key para este backend.

## Ejecutar

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 4000
```

El frontend de esta copia usa `http://127.0.0.1:4000/api`. Incluye `http://localhost:4200` en `CORS_ORIGINS`.

Swagger:

```text
http://localhost:4000/docs
```

Health check:

```text
GET http://localhost:4000/health
```

## Primer superadmin

Al levantar la API se crea automáticamente el superadmin usando:

```env
ADMIN_EMAIL=admin@inmobiliaria.com
ADMIN_PASSWORD=Admin12345!
```

Cambia esos datos en `.env` antes de producción.

## Flujo para frontend público

El frontend público NO necesita token.

### Listar propiedades publicadas

```http
GET /api/properties
```

Filtros disponibles:

```text
operation=rent|sale
category=casa
location=miami
city=miami
min_price=100000
max_price=500000
bedrooms=3
bathrooms=2
featured=true
```

Ejemplo:

```http
GET /api/properties?operation=venta&min_price=100000&max_price=400000&bedrooms=3
```

### Ver detalle público

```http
GET /api/properties/{property_id}
```

Solo devuelve la propiedad si `is_published=true`.

## Flujo para panel admin separado

### Login admin/superadmin

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin12345!"
}
```

Respuesta:

```json
{
  "access_token": "...",
  "token_type": "bearer",
  "user": {
    "id": "superadmin",
    "email": "admin@inmobiliaria.com",
    "full_name": "Super Admin",
    "role": "superadmin",
    "is_active": true
  }
}
```

En el panel admin, enviar siempre:

```http
Authorization: Bearer TOKEN_AQUI
```

### Admin/superadmin puede

```http
GET /api/properties/admin/all
GET /api/properties/admin/{property_id}
POST /api/properties
PATCH /api/properties/{property_id}
PATCH /api/properties/{property_id}/publish
PATCH /api/properties/{property_id}/unpublish
DELETE /api/properties/{property_id}
POST /api/properties/{property_id}/images
```

### Solo superadmin puede

```http
GET /api/users
POST /api/users
PATCH /api/users/{user_id}
PATCH /api/users/{user_id}/deactivate
```

## Modelo para crear propiedad

```json
{
  "title": "Casa moderna en zona céntrica",
  "description": "Casa amplia, remodelada y lista para vivir.",
  "operation": "venta",
  "price": 350000,
  "property_type": "casa",
  "bedrooms": 3,
  "bathrooms": 2,
  "area_m2": 180,
  "lot_size_m2": 300,
  "floors": 1,
  "location": "Miami, FL",
  "address": "123 Main St",
  "city": "Miami",
  "state": "FL",
  "amenities": ["garage", "patio", "piscina"],
  "images": [],
  "is_published": false,
  "featured": false
}
```

Recomendación: crear la propiedad como `is_published=false`, subir imágenes, revisar en el panel, y luego llamar `/publish`.

## Notas importantes para producción

- No subir `.env` al repositorio.
- No mandar `SUPABASE_SERVICE_ROLE_KEY` al frontend.
- Configurar `CORS_ORIGINS` con los dominios reales.
- Cambiar `JWT_SECRET` y password del superadmin.
- El frontend público solo debe usar `/api/properties` y `/api/properties/{id}`.
