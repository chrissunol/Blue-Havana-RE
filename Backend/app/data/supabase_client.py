from supabase import Client, create_client

from app.core.config import settings

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)


def response_data(response):
    # supabase-py v2 returns APIResponse with .data. Some errors are raised as exceptions.
    return getattr(response, "data", None) or []


def response_single(response):
    data = response_data(response)
    return data[0] if data else None
