

Desde la carpeta `backend`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip cache purge
pip install -r requirements.txt
```

Si no tienes Python 3.12 instalado, instala Python 3.12 desde python.org y marca la opción **Add Python to PATH**.

## Levantar API

```powershell
python -m uvicorn app.main:app --reload --port 4000
```

Luego abre:

```text
http://127.0.0.1:8000/docs
```
