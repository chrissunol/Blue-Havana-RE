from __future__ import annotations

import base64
import re
import unicodedata
from mimetypes import guess_extension
from uuid import uuid4

from app.core.config import settings
from app.data.supabase_client import response_data, response_single, supabase

PLACEHOLDER_IMAGE = "assets/images/placeholder.svg"


def _first_translation(value: dict | None) -> str:
    translations = value or {}

    for language in ("es", "en", "fr"):
        text = str(translations.get(language) or "").strip()
        if text:
            return text

    return ""


def _slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    ascii_text = "".join(
        char for char in normalized if unicodedata.category(char) != "Mn"
    )
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")
    return slug or f"article-{uuid4().hex[:8]}"


def _slug_exists(slug: str, exclude_id: str | None = None) -> bool:
    query = supabase.table("blog_articles").select("id").eq("slug", slug)
    if exclude_id:
        query = query.neq("id", exclude_id)
    return bool(response_data(query.limit(1).execute()))


def _unique_slug(value: str, exclude_id: str | None = None) -> str:
    base = _slugify(value)
    candidate = base
    suffix = 2
    while _slug_exists(candidate, exclude_id=exclude_id):
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def _upload_cover_image(data_url: str, article_id: str) -> str:
    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", data_url or "")
    if not match:
        return data_url or PLACEHOLDER_IMAGE

    content_type = match.group(1)
    extension = guess_extension(content_type) or ".jpg"
    path = f"articles/{article_id}/{uuid4().hex}{extension}"
    content = base64.b64decode(match.group(2))
    bucket = settings.supabase_blog_storage_bucket
    supabase.storage.from_(bucket).upload(
        path=path,
        file=content,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return supabase.storage.from_(bucket).get_public_url(path)


def upload_blog_image(
    content: bytes, content_type: str, filename: str | None = None
) -> str:
    extension = ".jpg"
    if filename and "." in filename:
        extension = "." + filename.rsplit(".", 1)[-1].lower()
    elif guess_extension(content_type):
        extension = guess_extension(content_type) or extension

    path = f"uploads/{uuid4().hex}{extension}"
    bucket = settings.supabase_blog_storage_bucket
    supabase.storage.from_(bucket).upload(
        path=path,
        file=content,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return supabase.storage.from_(bucket).get_public_url(path)


def _to_frontend(article: dict | None) -> dict | None:
    if not article:
        return None
    return {
        "id": article.get("id"),
        "slug": article.get("slug", ""),
        "title": article.get("title") or {"es": "", "en": "", "fr": ""},
        "excerpt": article.get("excerpt") or {"es": "", "en": "", "fr": ""},
        "content": article.get("content") or {"es": "", "en": "", "fr": ""},
        "category": article.get("category"),
        "author": article.get("author", ""),
        "coverImage": article.get("cover_image") or PLACEHOLDER_IMAGE,
        "status": article.get("status", "draft"),
        "featured": bool(article.get("featured", False)),
        "readingTime": int(article.get("reading_time") or 5),
        "publishedAt": str(article.get("published_at"))
        if article.get("published_at")
        else None,
        "createdAt": str(article.get("created_at")),
        "updatedAt": str(article.get("updated_at"))
        if article.get("updated_at")
        else None,
        "createdBy": article.get("created_by"),
        "updatedBy": article.get("updated_by"),
    }


def _to_db(payload: dict, article_id: str, *, partial: bool = False) -> dict:
    data: dict = {}
    mapping = {
        "title": "title",
        "excerpt": "excerpt",
        "content": "content",
        "category": "category",
        "author": "author",
        "status": "status",
        "featured": "featured",
        "readingTime": "reading_time",
    }
    for frontend_key, database_key in mapping.items():
        if frontend_key in payload:
            data[database_key] = payload[frontend_key]

    if "coverImage" in payload:
        data["cover_image"] = _upload_cover_image(
            payload.get("coverImage") or PLACEHOLDER_IMAGE, article_id
        )

    if not partial:
        data.setdefault("cover_image", PLACEHOLDER_IMAGE)
    return data


def list_public_articles(category: str | None = None) -> list[dict]:
    query = supabase.table("blog_articles").select("*").eq("status", "published")
    if category:
        query = query.eq("category", category)
    rows = response_data(
        query.order("featured", desc=True)
        .order("published_at", desc=True)
        .order("created_at", desc=True)
        .execute()
    )
    return [item for item in (_to_frontend(row) for row in rows) if item]


def get_public_article_by_slug(slug: str) -> dict | None:
    result = (
        supabase.table("blog_articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .limit(1)
        .execute()
    )
    return _to_frontend(response_single(result))


def list_admin_articles(
    status: str | None = None, category: str | None = None
) -> list[dict]:
    query = supabase.table("blog_articles").select("*")
    if status:
        query = query.eq("status", status)
    if category:
        query = query.eq("category", category)
    rows = response_data(query.order("created_at", desc=True).execute())
    return [item for item in (_to_frontend(row) for row in rows) if item]


def get_admin_article(article_id: str) -> dict | None:
    result = (
        supabase.table("blog_articles")
        .select("*")
        .eq("id", article_id)
        .limit(1)
        .execute()
    )
    return _to_frontend(response_single(result))


def create_article(payload: dict, user_id: str) -> dict:
    article_id = str(uuid4())
    requested_slug = (
        payload.get("slug")
        or _first_translation(payload.get("title"))
        or article_id
    )
    data = _to_db(payload, article_id)
    data.update(
        {
            "id": article_id,
            "slug": _unique_slug(requested_slug),
            "created_by": user_id,
            "updated_by": user_id,
        }
    )
    if data.get("status") == "published":
        data["published_at"] = "now()"
    if data.get("featured"):
        supabase.table("blog_articles").update({"featured": False}).eq(
            "featured", True
        ).execute()

    # PostgREST does not interpret now() as SQL in an insert payload.
    if data.get("published_at") == "now()":
        from datetime import datetime, timezone

        data["published_at"] = datetime.now(timezone.utc).isoformat()

    inserted = supabase.table("blog_articles").insert(data).execute()
    return _to_frontend(response_single(inserted)) or {}


def update_article(article_id: str, payload: dict, user_id: str) -> dict | None:
    current = get_admin_article(article_id)
    if not current:
        return None

    data = _to_db(payload, article_id, partial=True)
    if "slug" in payload and payload.get("slug"):
        data["slug"] = _unique_slug(payload["slug"], exclude_id=article_id)
    elif payload.get("title"):
        translated_title = _first_translation(payload["title"])
        if translated_title:
            data["slug"] = _unique_slug(
                translated_title,
                exclude_id=article_id,
            )

    if data.get("status") == "published" and current.get("status") != "published":
        from datetime import datetime, timezone

        data["published_at"] = datetime.now(timezone.utc).isoformat()
    elif data.get("status") == "draft":
        data["published_at"] = None

    if data.get("featured"):
        supabase.table("blog_articles").update({"featured": False}).eq(
            "featured", True
        ).neq("id", article_id).execute()

    data["updated_by"] = user_id
    updated = (
        supabase.table("blog_articles").update(data).eq("id", article_id).execute()
    )
    return _to_frontend(response_single(updated))


def delete_article(article_id: str) -> bool:
    existing = get_admin_article(article_id)
    if not existing:
        return False
    supabase.table("blog_articles").delete().eq("id", article_id).execute()
    return True
