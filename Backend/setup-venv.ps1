# Entorno virtual con Python 3.12 (recomendado para este proyecto)
$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "No se encontró el launcher 'py'. Instala Python 3.12 desde python.org"
}

$version = & py -3.12 --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python 3.12 no está instalado. Descárgalo: https://www.python.org/downloads/release/python-3120/"
}

Write-Host "Usando: $version"

if (Test-Path .venv) {
    Write-Host "Eliminando .venv anterior..."
    Remove-Item .venv -Recurse -Force
}

py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\pip.exe install -r requirements.txt

Write-Host ""
Write-Host "Listo. Activa el entorno con:"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host ""
Write-Host "Luego levanta la API:"
Write-Host "  uvicorn app.main:app --reload --host 127.0.0.1 --port 4000"
