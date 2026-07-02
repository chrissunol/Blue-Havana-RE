from __future__ import annotations

import base64
import re
from mimetypes import guess_extension
from uuid import uuid4

from app.core.config import settings
from app.core.security import hash_password
from app.data.supabase_client import response_data, response_single, supabase

SUPERADMIN_ID = "superadmin"
COMPANY_INFO_ID = "main"

DEFAULT_COMPANY_INFO = {
    "id": COMPANY_INFO_ID,
    "phone": "+53 00000000",
    "whatsapp": "+5352627046",
    "email": "bluehavanars@gmail.com",
    "address": "La Habana, Cuba",
    "facebook": "@bluehavanars",
    "instagram": "@bluehavanars",
    "x": "@bluehavanars",
    "telegram": "",
    "youtube": "",
    "origin_text": "Blue Havana Real Estate transforma el mercado inmobiliario cubano con estándares internacionales de transparencia, eficiencia y excelencia.",
    "today_text": "Brindar soluciones inmobiliarias integrales y de alto nivel.",
    "future_text": "Ser la empresa inmobiliaria líder y referente en Cuba.",
    "where_text": "Operamos principalmente en La Habana y sus zonas más exclusivas.",
}


def text_to_translated(value: str | None) -> dict:
    value = value or ""
    return {"es": value, "en": value, "fr": value}


def translated_to_text(value) -> str:
    if isinstance(value, dict):
        return value.get("es") or value.get("en") or value.get("fr") or ""
    return value or ""


def frontend_operation_to_db(operation: str | None) -> str | None:
    mapping = {
        "sale": "venta",
        "rent": "renta",
        "venta": "venta",
        "renta": "renta",
        "all": None,
    }
    return mapping.get(operation, operation)


def db_operation_to_frontend(operation: str | None) -> str | None:
    mapping = {
        "venta": "sale",
        "renta": "rent",
        "sale": "sale",
        "rent": "rent",
    }
    return mapping.get(operation, operation)


def _safe_features(value) -> dict:
    if isinstance(value, dict):
        return value
    return {}


def _safe_images(value) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if item]
    return []


def _upload_base64_image(property_id: str, data_url: str, index: int) -> str:
    """Sube imágenes base64 que manda Angular y devuelve la URL pública."""
    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", data_url)
    if not match:
        return data_url

    content_type = match.group(1)
    encoded = match.group(2)
    extension = guess_extension(content_type) or ".jpg"
    path = f"properties/{property_id}/{uuid4().hex}-{index}{extension}"

    content = base64.b64decode(encoded)
    supabase.storage.from_(settings.supabase_storage_bucket).upload(
        path=path,
        file=content,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return supabase.storage.from_(settings.supabase_storage_bucket).get_public_url(path)


def _normalize_images_for_db(images: list[str] | None, property_id: str) -> list[str]:
    normalized: list[str] = []
    for index, image in enumerate(images or []):
        if isinstance(image, str) and image.startswith("data:image/"):
            normalized.append(_upload_base64_image(property_id, image, index))
        elif image:
            normalized.append(str(image))
    return normalized


def frontend_property_to_db(payload: dict, property_id: str | None = None) -> dict:
    data = dict(payload)

    if "title" in data:
        data["title"] = translated_to_text(data["title"])

    if "description" in data:
        data["description"] = translated_to_text(data["description"])

    if "category" in data:
        data["property_type"] = translated_to_text(data.pop("category"))

    if "location" in data:
        data["location"] = translated_to_text(data["location"])

    if "listingType" in data:
        data["listing_type"] = data.pop("listingType")

    if "operation" in data:
        operation = frontend_operation_to_db(data["operation"])
        if operation:
            data["operation"] = operation
        else:
            data.pop("operation", None)

    if "area" in data:
        data["area_m2"] = data.pop("area")

    if "visible" in data:
        data["is_published"] = data.pop("visible")

    if "features" in data:
        data["amenities"] = data.pop("features") or {}

    if "images" in data and property_id:
        data["images"] = _normalize_images_for_db(data.get("images"), property_id)

    # Compatibilidad con el nombre usado por el frontend compilado.
    if "transactionStatus" in data:
        data["status"] = data.pop("transactionStatus")
    if "transaction_status" in data:
        data["status"] = data.pop("transaction_status")

    # Campos que existen en el frontend pero no en la tabla actual.
    data.pop("annualPrice", None)
    data.pop("pricePerM2", None)
    data.pop("code", None)
    data.pop("created_at", None)
    data.pop("updated_at", None)
    data.pop("created_by", None)
    data.pop("id", None)

    return data


def db_property_to_frontend(prop: dict | None) -> dict | None:
    if not prop:
        return None

    data = dict(prop)
    price = float(data.get("price") or 0)
    area = data.get("area_m2")
    area_float = float(area) if area is not None else 0

    return {
        "id": data.get("id"),
        "code": data.get("code"),
        "title": text_to_translated(data.get("title")),
        "category": text_to_translated(data.get("property_type")),
        "listingType": data.get("listing_type", "property"),
        "price": price,
        "annualPrice": price * 12
        if db_operation_to_frontend(data.get("operation")) == "rent"
        else None,
        "pricePerM2": round(price / area_float, 2) if area_float else None,
        "operation": db_operation_to_frontend(data.get("operation")),
        "location": text_to_translated(data.get("location")),
        "bedrooms": int(data.get("bedrooms") or 0),
        "bathrooms": float(data.get("bathrooms") or 0),
        "floors": data.get("floors"),
        "area": area_float,
        "images": _safe_images(data.get("images")),
        "visible": bool(data.get("is_published", False)),
        "featured": bool(data.get("featured", False)),
        "description": text_to_translated(data.get("description")),
        "features": _safe_features(data.get("amenities")),
        "status": data.get("status", "available"),
        "transactionStatus": data.get("status", "available"),
        "created_by": data.get("created_by"),
        "created_at": str(data.get("created_at")) if data.get("created_at") else None,
        "updated_at": str(data.get("updated_at")) if data.get("updated_at") else None,
    }


def db_properties_to_frontend(properties: list[dict]) -> list[dict]:
    return [
        item for item in (db_property_to_frontend(prop) for prop in properties) if item
    ]


def ensure_superadmin() -> None:
    """Garantiza un superadmin inicial sin fallar si ya existe.

    Si ya existe, solo asegura que siga activo y con rol de superadmin.
    No reescribe email, usuario ni contrasena en cada arranque.
    """
    admin_email = settings.admin_email.lower()
    admin_username = (
        (settings.admin_username or admin_email.split("@")[0]).strip().lower()
    )
    admin_payload = {
        "email": admin_email,
        "full_name": settings.admin_full_name,
        "username": admin_username,
        "phone": "",
        "hashed_password": hash_password(settings.admin_password),
        "role": "superadmin",
        "is_active": True,
    }

    existing_by_id = get_user_by_id(SUPERADMIN_ID)
    if existing_by_id:
        supabase.table("users").update(
            {"role": "superadmin", "is_active": True}
        ).eq("id", SUPERADMIN_ID).execute()
        return

    existing_by_email = get_user_by_email(admin_email)
    if existing_by_email:
        supabase.table("users").update(
            {"role": "superadmin", "is_active": True}
        ).eq("id", existing_by_email["id"]).execute()
        return

    supabase.table("users").insert(
        {
            "id": SUPERADMIN_ID,
            **admin_payload,
        }
    ).execute()


def sanitize_user(user: dict | None) -> dict | None:
    if not user:
        return None
    clean = dict(user)
    clean.pop("hashed_password", None)
    return clean


def get_user_by_email(email: str) -> dict | None:
    res = (
        supabase.table("users")
        .select("*")
        .eq("email", email.lower())
        .limit(1)
        .execute()
    )
    return response_single(res)


def get_user_by_username(username: str) -> dict | None:
    normalized = (username or "").strip().lower()
    if not normalized:
        return None
    res = (
        supabase.table("users")
        .select("*")
        .ilike("username", normalized)
        .limit(1)
        .execute()
    )
    return response_single(res)


def get_user_by_id(user_id: str) -> dict | None:
    res = (
        supabase.table("users")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    return response_single(res)


def list_users() -> list[dict]:
    res = (
        supabase.table("users")
        .select(
            "id,email,full_name,username,phone,role,is_active,created_at"
        )
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return response_data(res)

def delete_user(user_id: str) -> bool:
    existing_user = get_user_by_id(user_id)

    if not existing_user:
        return False

    supabase.table("users").delete().eq("id", user_id).execute()

    return get_user_by_id(user_id) is None


def create_user(payload: dict) -> dict:
    data = dict(payload)
    password = data.pop("password")
    data["id"] = str(data.get("id") or uuid4())
    data["email"] = data["email"].lower()
    data["username"] = (
        (data.get("username") or data["email"].split("@")[0]).strip().lower()
    )
    data["phone"] = str(data.get("phone") or "").strip()
    data["hashed_password"] = hash_password(password)
    res = supabase.table("users").insert(data).execute()
    return sanitize_user(response_single(res))


def update_user(user_id: str, payload: dict) -> dict | None:
    updates = dict(payload)
    password = updates.pop("password", None)
    if password:
        updates["hashed_password"] = hash_password(password)
    if "email" in updates and updates["email"]:
        updates["email"] = updates["email"].lower()
    if "username" in updates and updates["username"]:
        updates["username"] = updates["username"].strip().lower()
    if "phone" in updates:
        updates["phone"] = str(updates.get("phone") or "").strip()
    if not updates:
        return sanitize_user(get_user_by_id(user_id))
    res = supabase.table("users").update(updates).eq("id", user_id).execute()
    return sanitize_user(response_single(res))


def deactivate_user(user_id: str) -> dict | None:
    res = (
        supabase.table("users").update({"is_active": False}).eq("id", user_id).execute()
    )
    return sanitize_user(response_single(res))


def _apply_property_filters(query, filters: dict):
    operation = frontend_operation_to_db(filters.get("operation"))
    if operation in {"venta", "renta"}:
        query = query.eq("operation", operation)
    if filters.get("property_type"):
        query = query.ilike("property_type", f"%{filters['property_type']}%")
    if filters.get("location"):
        query = query.ilike("location", f"%{filters['location']}%")
    if filters.get("city"):
        query = query.ilike("city", f"%{filters['city']}%")
    if filters.get("min_price") is not None:
        query = query.gte("price", filters["min_price"])
    if filters.get("max_price") is not None:
        query = query.lte("price", filters["max_price"])
    if filters.get("bedrooms") is not None:
        query = query.gte("bedrooms", filters["bedrooms"])
    if filters.get("bathrooms") is not None:
        query = query.gte("bathrooms", filters["bathrooms"])
    if filters.get("featured") is not None:
        query = query.eq("featured", filters["featured"])
    if filters.get("listing_type"):
        query = query.eq("listing_type", filters["listing_type"])

    for feature in filters.get("features") or []:
        if isinstance(feature, str) and feature.strip():
            query = query.contains("amenities", {feature.strip(): True})

    return query


def list_public_properties(filters: dict) -> list[dict]:
    query = (
        supabase.table("properties")
        .select("*")
        .eq("is_published", True)
        .eq("status", "available")
    )
    data = (
        _apply_property_filters(query, filters)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return db_properties_to_frontend(data)


def list_admin_properties(filters: dict) -> list[dict]:
    query = supabase.table("properties").select("*")
    data = (
        _apply_property_filters(query, filters)
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return db_properties_to_frontend(data)


def get_public_property(property_id: str) -> dict | None:
    res = (
        supabase.table("properties")
        .select("*")
        .eq("id", property_id)
        .eq("is_published", True)
        .eq("status", "available")
        .limit(1)
        .execute()
    )
    return db_property_to_frontend(response_single(res))


def get_any_property(property_id: str) -> dict | None:
    res = (
        supabase.table("properties")
        .select("*")
        .eq("id", property_id)
        .limit(1)
        .execute()
    )
    return db_property_to_frontend(response_single(res))


def create_property(payload: dict, created_by: str) -> dict:
    property_id = str(uuid4())
    data = frontend_property_to_db(payload, property_id=property_id)
    data["id"] = property_id
    data["code"] = f"PROP-{property_id[:8].upper()}"
    data["created_by"] = created_by
    data.setdefault("status", "available")

    res = supabase.table("properties").insert(data).execute()
    return db_property_to_frontend(response_single(res))


def update_property(property_id: str, updates: dict) -> dict | None:
    if not updates:
        return get_any_property(property_id)

    data = frontend_property_to_db(updates, property_id=property_id)
    if not data:
        return get_any_property(property_id)

    res = supabase.table("properties").update(data).eq("id", property_id).execute()
    return db_property_to_frontend(response_single(res))


def delete_property(property_id: str) -> None:
    supabase.table("properties").delete().eq("id", property_id).execute()


def company_info_to_frontend(info: dict | None) -> dict:
    data = dict(DEFAULT_COMPANY_INFO)
    if info:
        data.update(info)
    return {
        "phone": data.get("phone", ""),
        "whatsapp": data.get("whatsapp", ""),
        "email": data.get("email", ""),
        "address": data.get("address", ""),
        "facebook": data.get("facebook", ""),
        "instagram": data.get("instagram", ""),
        "x": data.get("x", ""),
        "telegram": data.get("telegram", ""),
        "youtube": data.get("youtube", ""),
        "originText": data.get("origin_text", ""),
        "todayText": data.get("today_text", ""),
        "futureText": data.get("future_text", ""),
        "whereText": data.get("where_text", ""),
    }


def company_info_to_db(payload: dict) -> dict:
    field_mapping = {
        "phone": "phone",
        "whatsapp": "whatsapp",
        "email": "email",
        "address": "address",
        "facebook": "facebook",
        "instagram": "instagram",
        "x": "x",
        "telegram": "telegram",
        "youtube": "youtube",
        "originText": "origin_text",
        "todayText": "today_text",
        "futureText": "future_text",
        "whereText": "where_text",
    }
    data = {"id": COMPANY_INFO_ID}
    for frontend_key, database_key in field_mapping.items():
        if frontend_key in payload:
            data[database_key] = payload[frontend_key] or ""
    return data


def ensure_company_info() -> dict:
    res = (
        supabase.table("company_information")
        .select("*")
        .eq("id", COMPANY_INFO_ID)
        .limit(1)
        .execute()
    )
    existing = response_single(res)
    if existing:
        return existing
    inserted = (
        supabase.table("company_information").insert(DEFAULT_COMPANY_INFO).execute()
    )
    return response_single(inserted) or DEFAULT_COMPANY_INFO


def get_company_info() -> dict:
    return company_info_to_frontend(ensure_company_info())


def update_company_info(payload: dict) -> dict:
    ensure_company_info()
    data = company_info_to_db(payload)
    data.pop("id", None)
    if not data:
        return get_company_info()
    res = (
        supabase.table("company_information")
        .update(data)
        .eq("id", COMPANY_INFO_ID)
        .execute()
    )
    return company_info_to_frontend(response_single(res) or ensure_company_info())


def reset_company_info() -> dict:
    res = supabase.table("company_information").upsert(DEFAULT_COMPANY_INFO).execute()
    return company_info_to_frontend(response_single(res))
