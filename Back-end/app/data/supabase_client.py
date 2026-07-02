from typing import Any

from supabase import Client, create_client

from app.core.config import settings


supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)


def response_data(response: Any):
    """Obtiene data de una respuesta de Supabase sin alterar su tipo."""
    data = getattr(response, "data", None)

    if data is None:
        return []

    return data


def response_single(response: Any) -> dict | None:
    """Acepta respuestas en forma de lista o de objeto."""
    data = response_data(response)

    if isinstance(data, list):
        return data[0] if data else None

    if isinstance(data, dict):
        return data

    return None