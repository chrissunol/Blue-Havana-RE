# Instalación en Windows

Desde la carpeta del backend:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

Copia el archivo de variables:

```powershell
Copy-Item .env.example .env
```

Completa `.env` con las credenciales reales de Supabase y ejecuta primero:

```text
supabase/migration_backend_v2.sql
```

en el SQL Editor de Supabase.

## Levantar la API

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 4000
```

Luego abre:

```text
http://127.0.0.1:4000/docs
```

Health check:

```text
http://127.0.0.1:4000/health
```
